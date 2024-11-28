# webgl-toolkit

### ideas
- reorder setup/predraw calls to avoid state breaking
- introduce shader program class to optimize shader replace/recomp management
- move prepare code to draw loop
  - add additional needRedraw call before
  - allow previous passes to affect prepare
- add postFrame callback to manage picking in (should be controlled by app and not always done)
- add picking logic to renderer for easier use
- standardize function names (_ or not)
- add debugging tools
  - framebuffer views
  - shader editor
  - renderpass list
