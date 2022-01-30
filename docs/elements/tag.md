# Tag
Elemento para destaque em pequenos textos informativos

### Exemplos

<div class="docs-components">
  <span class="o-tag">Minha Tag</span>
</div>

```html
<span class="o-tag">Minha Tag</span>
```

### Cores

<div class="docs-components">
  <span class="o-tag">Minha Tag</span>
  <span class="o-tag -blue">Tag Azul</span>
  <span class="o-tag -green">Tag Verde</span>
  <span class="o-tag -red">Tag Vermelha</span>
  <span class="o-tag -yellow">Tag Amarela</span>
</div>

```html
<span class="o-tag">Minha Tag</span>
<span class="o-tag -blue">Tag Azul</span>
<span class="o-tag -green">Tag Verde</span>
<span class="o-tag -red">Tag Vermelha</span>
<span class="o-tag -yellow">Tag Amarela</span>
```

<div class="docs-components">
  <span class="o-tag -inverted">Minha Tag</span>
  <span class="o-tag -inverted -blue">Tag Azul</span>
  <span class="o-tag -inverted -green">Tag Verde</span>
  <span class="o-tag -inverted -red">Tag Vermelha</span>
  <span class="o-tag -inverted -yellow">Tag Amarela</span>
</div>

```html
<span class="o-tag -inverted">Minha Tag</span>
<span class="o-tag -inverted -blue">Tag Azul</span>
<span class="o-tag -inverted -green">Tag Verde</span>
<span class="o-tag -inverted -red">Tag Vermelha</span>
<span class="o-tag -inverted -yellow">Tag Amarela</span>
```

### Estilos

<div class="docs-components">
  <span class="o-tag -outline">Tag Outline</span>
  <span class="o-tag -outline">
    <span class="o-dot -green">Tag com Dot</span>
  </span>
  <span class="o-tag -outline">
    <span class="o-dot -red -pulse">Dot Pulsante</span>
  </span>
</div>

```html
<span class="o-tag -outline">Tag Outline</span>

<div class="o-tag -outline">
  <span class="o-dot -green">Tag com Dot</span>
</div>

<div class="o-tag -outline">
  <span class="o-dot -red -pulse">Dot Pulsante</span>
</div>
```

### Ícones

<div class="docs-components">
  <div class="o-tag">
    <i class="o-tag-icon fas fa-user"></i> Tag com Ícone
  </div>
</div>

```html
<div class="o-tag">
  <i class="o-tag-icon fas fa-user"></i> Tag com Ícone
</div>
```

<button class="btn">Default</button>
<button class="btn btn-primary">Primary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-danger">Danger</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-info">Info</button>
<button class="btn btn-link">Link</button>

<h3 class="u-margin-top-6">Disabled</h3>

<button class="btn" disabled>Default</button>
<button class="btn btn-primary" disabled>Primary</button>
<button class="btn btn-link" disabled>Link</button>

<h3 class="u-margin-top-6">Loading</h3>

<button class="btn -loading">Default</button>
<button class="btn btn-primary -loading">Primary</button>
<button class="btn btn-danger -loading">Danger</button>
<button class="btn btn-link -loading">Link</button>

<h3 class="u-margin-top-6">Button Group</h3>

<div class="btn-group">
  <button type="button" class="btn btn-radio -active">Inicial</button>
  <button type="button" class="btn btn-radio">Intermediária</button>
  <button type="button" class="btn btn-radio">Final</button>
</div>

<h3 class="u-margin-top-6">Button Mini</h3>

<button class="btn btn-mini">Default</button>

<h3 class="u-margin-top-6">Loading</h3>

<button class="btn">
  <i class="btn-icon fas fa-pen"></i>
  <span>Default</span>
</button>
<button class="btn btn-primary">
  <i class="btn-icon fas fa-user"></i>
  <span>Primary</span>
</button>
<button class="btn btn-link">
  <i class="btn-icon fas fa-pen"></i>
  <span>Início</span>
</button>
<button class="btn btn-link">
  <span>Fim</span>
  <i class="btn-icon fas fa-eye"></i>
</button>


<h1>Form Validation</h1>

<div class="o-form-group">
  <label class="o-form-label">Field Label</label>
  <div class="o-form-ctrl">
    <input xname type="text" autocomplete="off">
  </div>
  <div class="o-form-hint">
    Eu sou uma mensagem de dica
  </div>
</div>

<h3>Form Control States</h3>

<h5><code>-error</code></h5>

<div class="o-form-group">
  <div class="o-form-label">Field Label</div>
  <div class="o-form-ctrl -error">
    <input xname type="text" autocomplete="off">
  </div>
  <div class="o-form-hint">
    Eu sou uma mensagem de dica
  </div>
</div>

<h5><code>-success</code></h5>

<div class="o-form-group">
  <div class="o-form-label">Field Label</div>
  <div class="o-form-ctrl -success">
    <input xname type="text" autocomplete="off">
  </div>
  <div class="o-form-hint">
    Eu sou uma mensagem de dica
  </div>
</div>

<h3>Hint Variantes</h3>

<h5><code>-error</code></h5>

<div class="o-form-group">
  <div class="o-form-label">Field Label</div>
  <div class="o-form-ctrl">
    <input xname type="text" autocomplete="off">
  </div>
  <div class="o-form-hint -error">
    Eu sou uma mensagem de erro
  </div>
</div>

<div class="o-form-group">
  <div class="o-form-label">Field Label</div>
  <div class="o-form-ctrl">
    <textarea xname></textarea>
  </div>
  <div class="o-form-hint -error">
    Eu sou uma mensagem de erro em textarea
  </div>
</div>

<h5><code>-success</code></h5>

<div class="o-form-group">
  <div class="o-form-label">Field Label</div>
  <div class="o-form-ctrl">
    <input xname type="text" autocomplete="off">
  </div>
  <div class="o-form-hint -success">
    Eu sou uma mensagem de sucesso
  </div>
</div>
