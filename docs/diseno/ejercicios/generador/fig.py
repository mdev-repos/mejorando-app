import math
OUT=3.6  # grosor del contorno
def hull(pts):
    pts=sorted(set(pts))
    def cross(o,a,b): return (a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0])
    lo=[]
    for p in pts:
        while len(lo)>=2 and cross(lo[-2],lo[-1],p)<=0: lo.pop()
        lo.append(p)
    up=[]
    for p in reversed(pts):
        while len(up)>=2 and cross(up[-2],up[-1],p)<=0: up.pop()
        up.append(p)
    return lo[:-1]+up[:-1]
def cap(p1,r1,p2,r2,grow=0):
    pts=[]
    for (x,y),r in ((p1,r1),(p2,r2)):
        for k in range(28):
            a=2*math.pi*k/28; pts.append((round(x+(r+grow)*math.cos(a),2),round(y+(r+grow)*math.sin(a),2)))
    return hull(pts)
def poly(h): return ' '.join(f'{x},{y}' for x,y in h)

class Fig:
    def __init__(s): s.items=[]
    def group(s,parts):
        """parts: lista de (p1,r1,p2,r2). Se dibujan todos los contornos y después los rellenos, para que se fundan."""
        blk=''.join(f'<polygon points="{poly(cap(*p,grow=OUT))}"/>' for p in parts)
        wht=''.join(f'<polygon points="{poly(cap(*p))}"/>' for p in parts)
        s.items.append(f'<g fill="#000" stroke="#000" stroke-width="1" stroke-linejoin="round">{blk}</g><g fill="#fff">{wht}</g>')
    def head(s,c,rx=15,ry=19,rot=0):
        s.items.append(f'<ellipse cx="{c[0]}" cy="{c[1]}" rx="{rx}" ry="{ry}" transform="rotate({rot} {c[0]} {c[1]})" fill="#fff" stroke="#000" stroke-width="{OUT}"/>')
    def line(s,pts,w=OUT,fill='none'):
        s.items.append(f'<polyline points="{poly(pts)}" fill="{fill}" stroke="#000" stroke-width="{w}" stroke-linecap="round" stroke-linejoin="round"/>')
    def shape(s,pts,fill='#fff',w=OUT):
        s.items.append(f'<polygon points="{poly(pts)}" fill="{fill}" stroke="#000" stroke-width="{w}" stroke-linejoin="round"/>')
    def circle(s,c,r,fill='#fff',w=OUT):
        s.items.append(f'<circle cx="{c[0]}" cy="{c[1]}" r="{r}" fill="{fill}" stroke="#000" stroke-width="{w}"/>')
    def ellipse(s,c,rx,ry,rot=0,fill='#fff',w=OUT):
        s.items.append(f'<ellipse cx="{c[0]}" cy="{c[1]}" rx="{rx}" ry="{ry}" transform="rotate({rot} {c[0]} {c[1]})" fill="{fill}" stroke="#000" stroke-width="{w}"/>')
    def bench(s,x1,x2,top,floor=360,t=10):
        s.shape([(x1,top),(x2,top),(x2,top+t),(x1,top+t)])
        for x in (x1+14,x2-14): s.line([(x,top+t),(x,floor)])
        s.line([(x1+4,floor),(x1+24,floor)]); s.line([(x2-24,floor),(x2-4,floor)])
    def dumbbell(s,c,ang=0,L=26):
        dx,dy=math.cos(math.radians(ang))*L/2,math.sin(math.radians(ang))*L/2
        s.line([(c[0]-dx,c[1]-dy),(c[0]+dx,c[1]+dy)],w=OUT+2)
        for sg in (-1,1):
            s.ellipse((c[0]+sg*dx,c[1]+sg*dy),7,11,ang,fill='#fff')
    def svg(s,w=400,h=400):
        return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}"><rect width="{w}" height="{h}" fill="#fff"/>'+''.join(s.items)+'</svg>'
