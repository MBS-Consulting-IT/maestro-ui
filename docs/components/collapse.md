# Collapse

<div class="o-collapse-item -open">
  <header class="o-collapse-header">
    <strong>Produtos</strong> <span class="o-tag u-margin-left-2">4</span>
    <span class="o-collapse-summary">
      PGR, PCMSO, Higiene Ocupacional... 
    </span>
  </header>
  <div class="o-collapse-body">
    <p>Hello</p>
  </div>
</div>

<div class="main-test u-margin-top-10">
  <div class="test header" data-toggler>Header</div>
  <div class="test content">Content</div>
</div>

<style lang="scss">
.test.-open {
  border: 1px solid red;
}
</style>

<script>
import { Toggler } from '../../src/js/toggler'

setTimeout(() => {
  Toggler('[data-toggler]', {
    content: document.querySelectorAll('.test')
  })
}, 150)

console.log(Toggler)
</script>
