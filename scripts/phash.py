from PIL import Image
import numpy as np
def dh(im, n=16):
    im=im.convert('RGBA'); bg=Image.new('RGBA',im.size,(255,255,255,255)); bg.alpha_composite(im)
    g=np.asarray(bg.convert('L').resize((n+1,n),Image.LANCZOS),dtype=float)
    return (g[:,1:]>g[:,:-1]).flatten()
def dist(a,b): return int((a!=b).sum())
