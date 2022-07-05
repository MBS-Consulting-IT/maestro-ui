// @vitest-environment happy-dom

import { test, expect, beforeAll, vi } from 'vitest'
import { resolveReference } from './resolve-reference'

const NAME = 'TestReference'

beforeAll(() => {
  document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <div id="some-id"><div>
      <div id="another-id"><div>
      <div class="o-item"><div>
      <div class="o-item"><div>
      <div class="o-item">
        <div class="o-inner"></div>
        <div class="o-inner"></div>
      <div>
      <div data-item><div>
      <div data-item><div>
    `
  )

  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

test('Deve retornar um HTMLElement', () => {
  const domElement = document.querySelector('#some-id')
  const element = resolveReference(domElement, { name: NAME })

  expect(element).toBeInstanceOf(HTMLElement)
})

test('Deve retornar um array de HTMLElements a partir de um NodeList', () => {
  const reference = document.querySelectorAll('.o-item')
  const elements = resolveReference(reference, { name: NAME })

  const isValid = elements
    .every(element => element instanceof HTMLElement) &&
    elements.length === 3

  expect(isValid).toBeTruthy()
})

test('Deve retornar um array de HTMLElements a partir de um HTMLCollection', () => {
  const reference = document.getElementsByClassName('o-inner')
  const elements = resolveReference(reference, { name: NAME })

  const isValid = elements
    .every(element => element instanceof HTMLElement) &&
    elements.length === 2

  expect(isValid).toBeTruthy()
})

test('Deve retornar um array de HTMLElements a partir de um array de HTMLElements', () => {
  const reference = [
    document.querySelector('#some-id'),
    document.querySelector('#another-id')
  ]

  const elements = resolveReference(reference, { name: NAME })

  const isValid = elements
    .every(element => element instanceof HTMLElement) &&
    elements.length === 2

  expect(isValid).toBeTruthy()
})

test('Deve retornar um array de HTMLElements a partir de uma queryString', () => {
  const elements = resolveReference('[data-item]', { name: NAME })

  const isValid = elements
    .every(element => element instanceof HTMLElement) &&
    elements.length === 2

  expect(isValid).toBeTruthy()
})

/**
 * @todo verificar diferença entre vitest e jest
 */
test.skip('Não deve retornar a partir de uma queryString inválida', () => {
  const element = resolveReference('? & !', { name: NAME })

  expect(element).toBeUndefined()
})

test('Não deve retornar a partir de uma referência nula', () => {
  const element = resolveReference(null, { name: NAME })

  expect(element).toBeUndefined()
})

test('Não deve retornar a partir de uma referência numérica', () => {
  const element = resolveReference(100, { name: NAME })

  expect(element).toBeUndefined()
})
