import os
import torch, torch.nn as nn, torch.nn.functional as F, numpy as np, sys
from PIL import Image
torch.set_num_threads(2)
class RDB(nn.Module):
    def __init__(s, nf=64, gc=32):
        super().__init__()
        s.conv1=nn.Conv2d(nf,gc,3,1,1); s.conv2=nn.Conv2d(nf+gc,gc,3,1,1); s.conv3=nn.Conv2d(nf+2*gc,gc,3,1,1)
        s.conv4=nn.Conv2d(nf+3*gc,gc,3,1,1); s.conv5=nn.Conv2d(nf+4*gc,nf,3,1,1); s.l=nn.LeakyReLU(0.2,True)
    def forward(s,x):
        x1=s.l(s.conv1(x)); x2=s.l(s.conv2(torch.cat((x,x1),1))); x3=s.l(s.conv3(torch.cat((x,x1,x2),1)))
        x4=s.l(s.conv4(torch.cat((x,x1,x2,x3),1))); x5=s.conv5(torch.cat((x,x1,x2,x3,x4),1)); return x5*0.2+x
class RRDB(nn.Module):
    def __init__(s,nf=64):
        super().__init__(); s.rdb1=RDB(nf); s.rdb2=RDB(nf); s.rdb3=RDB(nf)
    def forward(s,x): return s.rdb3(s.rdb2(s.rdb1(x)))*0.2+x
class RRDBNet(nn.Module):
    def __init__(s,nf=64,nb=23):
        super().__init__()
        s.conv_first=nn.Conv2d(3,nf,3,1,1); s.body=nn.Sequential(*[RRDB(nf) for _ in range(nb)])
        s.conv_body=nn.Conv2d(nf,nf,3,1,1); s.conv_up1=nn.Conv2d(nf,nf,3,1,1); s.conv_up2=nn.Conv2d(nf,nf,3,1,1)
        s.conv_hr=nn.Conv2d(nf,nf,3,1,1); s.conv_last=nn.Conv2d(nf,3,3,1,1); s.l=nn.LeakyReLU(0.2,True)
    def forward(s,x):
        f=s.conv_first(x); f=f+s.conv_body(s.body(f))
        f=s.l(s.conv_up1(F.interpolate(f,scale_factor=2,mode='nearest')))
        f=s.l(s.conv_up2(F.interpolate(f,scale_factor=2,mode='nearest')))
        return s.conv_last(s.l(s.conv_hr(f)))
_m=None
def model():
    global _m
    if _m is None:
        _m=RRDBNet(); sd=torch.load(os.path.join(os.environ.get('ESRGAN_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), '_models')), 'RealESRGAN_x4plus.pth'),map_location='cpu')
        _m.load_state_dict(sd.get('params_ema',sd)); _m.eval()
    return _m
@torch.no_grad()
def up_rgb(arr):  # HxWx3 uint8 -> 4x
    t=torch.from_numpy(arr).permute(2,0,1).float().div(255)[None]
    h,w=arr.shape[:2]; T=192; P=12; out=torch.zeros(1,3,h*4,w*4)
    for y in range(0,h,T):
        for x in range(0,w,T):
            y0,x0=max(0,y-P),max(0,x-P); y1,x1=min(h,y+T+P),min(w,x+T+P)
            o=model()(t[:,:,y0:y1,x0:x1])
            oy,ox=(y-y0)*4,(x-x0)*4; th,tw=min(T,h-y)*4,min(T,w-x)*4
            out[:,:,y*4:y*4+th,x*4:x*4+tw]=o[:,:,oy:oy+th,ox:ox+tw]
    return (out[0].clamp(0,1).permute(1,2,0).numpy()*255).round().astype(np.uint8)
def upscale(im, maxside):
    im=im.convert('RGBA'); a=np.array(im)
    alpha=a[:,:,3]; rgb=a[:,:,:3].copy()
    # rellenar fondo transparente con blanco para evitar halos oscuros
    m=(alpha<8); rgb[m]=255
    big=Image.fromarray(up_rgb(rgb))
    al=Image.fromarray(alpha).resize(big.size,Image.LANCZOS)
    big.putalpha(al)
    s=maxside/max(big.size)
    if s<1: big=big.resize((round(big.width*s),round(big.height*s)),Image.LANCZOS)
    return big
if __name__=='__main__':
    import time; t=time.time()
    upscale(Image.open(sys.argv[1]),int(sys.argv[3])).save(sys.argv[2]); print('ok',time.time()-t)

class SRVGG(nn.Module):
    def __init__(s, nf=64, nc=32, up=4):
        super().__init__()
        s.body=nn.ModuleList([nn.Conv2d(3,nf,3,1,1), nn.PReLU(nf)])
        for _ in range(nc): s.body.append(nn.Conv2d(nf,nf,3,1,1)); s.body.append(nn.PReLU(nf))
        s.body.append(nn.Conv2d(nf,3*up*up,3,1,1)); s.ps=nn.PixelShuffle(up); s.up=up
    def forward(s,x):
        o=x
        for l in s.body: o=l(o)
        return s.ps(o)+F.interpolate(x,scale_factor=s.up,mode='nearest')
def use_fast():
    global _m
    _m=SRVGG(); sd=torch.load(os.path.join(os.environ.get('ESRGAN_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), '_models')), 'realesr-general-x4v3.pth'),map_location='cpu')
    _m.load_state_dict(sd.get('params',sd)); _m.eval()
