# graph/generate_graph.py
import sys
from Fund import value
from graphwizard import draw_dot

def generate(x, y, z, activation):
    x = value(float(x), label="x")
    y = value(float(y), label="y")
    z = value(float(z), label="z")

    out = x * y + z
    if activation == "tanh":
        out = out.tanh()
    elif activation == "sigmoid":
        out = out.sigmoid()
    elif activation == "relu":
        out = out.relu()

    dot = draw_dot(out)
    svg = dot.pipe().decode("utf-8")
    return svg

if __name__ == "__main__":
    x, y, z, activation = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4]
    print(generate(x, y, z, activation))
