# Switch

<br>
<br>
<br>

<div data-switch>
  <select label="Realizada" name="inp29034" xname="inpagendaStatus">
    <option>Selecione</option>
    <option value="Realizada">Realizada</option>
  </select>
  <em></em>
</div>

<br>
<br>
<br>

<div class="o-switch" tabindex="0">
  <div class="o-switch-inner"></div>
  <label class="o-switch-label">Realizada</label>
</div>

<script>
import { Switch } from '../../src/js/switch'

setTimeout(() => {
  Switch('[data-switch]')
}, 500);
</script>
