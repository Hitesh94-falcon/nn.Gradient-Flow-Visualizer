import sys
from Fund import value
from graphwizard import draw_dot

def generate(x1, x2, w1, w2, b, activation):
    # --- Build computation graph ---
    x1 = value(float(x1), label='x1')
    x2 = value(float(x2), label='x2')
    w1 = value(float(w1), label='w1')
    w2 = value(float(w2), label='w2')
    b  = value(float(b),  label='b')

    
    x1w1 = x1 * w1; x1w1.label = 'x1*w1'
    x2w2 = x2 * w2; x2w2.label = 'x2*w2'
    x1w1x2w2 = x1w1 + x2w2; x1w1x2w2.label = 'x1*w1 + x2*w2' 
    n = x1w1x2w2 + b; n.label = 'n'

    # activation
    if activation == "relu":
        o = n.relu(); o.label = "ReLU"
    elif activation == "tanh":
        o = n.tanh(); o.label = "tanh"
    elif activation == "sigmoid":
        o = n.sigmoid(); o.label = "sigmoid"
    else:
        raise ValueError(f"Unknown activation: {activation}")

    # backward pass 
    o.backward()

    # --- Draw graph ---
    dot = draw_dot(o)
    svg = dot.pipe().decode("utf-8")
    return svg

if __name__ == "__main__":
    x1, x2, w1, w2, b, activation = sys.argv[1:7]
    print(generate(x1, x2, w1, w2, b, activation))
