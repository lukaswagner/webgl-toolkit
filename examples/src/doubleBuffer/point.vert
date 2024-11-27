#version 300 es
precision mediump float;

in vec2 a_basePosition;

const vec3 c_selectedColor = vec3(0.2, 0.7, 0.2);
const vec3 c_baseColor = vec3(0.5);

uniform int u_selected;

out float v_id;
out vec3 v_color;
out vec2 v_uv;

void main()
{
    v_id = float(gl_VertexID);
    bool selected = gl_VertexID == u_selected;
    v_color = selected ? c_selectedColor : c_baseColor;
    v_uv = a_basePosition;
    gl_PointSize = 15.;
    gl_Position = vec4(a_basePosition * 2. - 1., 0.0, 1.0);
}
