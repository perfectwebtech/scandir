/* @flow */

import Path from 'path'
import { it } from 'jasmine-fix'
import scanDirectory from '../src'
import { expectToThrow } from './helpers'

describe('scandir', function() {
  function scandir(a: any, b: any, c: any) {
    return scanDirectory(a, b, c)
  }
  function getFixturePath(path) {
    return Path.join(__dirname, 'fixtures', path)
  }

  it('throws an error if path is invalid', async function() {
    await expectToThrow(async function() {
      await scandir()
    }, 'path must be a valid string')
    await expectToThrow(async function() {
      await scandir(null)
    }, 'path must be a valid string')
    await expectToThrow(async function() {
      await scandir({})
    }, 'path must be a valid string')
    await expectToThrow(async function() {
      await scandir(function() {})
    }, 'path must be a valid string')
    await expectToThrow(async function() {
      await scandir(NaN)
    }, 'path must be a valid string')
  })
  it('throws if validate is invalid', async function() {
    await expectToThrow(async function() {
      await scandir(__dirname, false, true)
    }, 'validate must be a valid function')
    await expectToThrow(async function() {
      await scandir(__dirname, false, 'asd')
    }, 'validate must be a valid function')
    await expectToThrow(async function() {
      await scandir(__dirname, false, {})
    }, 'validate must be a valid function')
  })
  it('properly scans the given directory', async function() {
    const results = await scandir(getFixturePath('normal'))
    expect(results.files).toEqual([getFixturePath('normal/a'), getFixturePath('normal/b')])
    expect(results.directories).toEqual([getFixturePath('normal')])
  })
  it('ignores dot files by default', async function() {
    const results = await scandir(getFixturePath('ignore-default'))
    expect(results.files).toEqual([getFixturePath('ignore-default/a'), getFixturePath('ignore-default/c')])
    expect(results.directories).toEqual([getFixturePath('ignore-default')])
  })
  it('recurses when we tell it to', async function() {
    const results = await scandir(getFixturePath('recursive'))
    expect(results.files).toEqual([getFixturePath('recursive/a'), getFixturePath('recursive/b/c')])
    expect(results.directories).toEqual([getFixturePath('recursive'), getFixturePath('recursive/b')])
  })
  it('does not recurse when we tell it to', async function() {
    const results = await scandir(getFixturePath('recursive'), false)
    expect(results.files).toEqual([getFixturePath('recursive/a')])
    expect(results.directories).toEqual([getFixturePath('recursive')])
  })
  it('has a working validate method', async function() {
    const results = await scandir(getFixturePath('validate'), true, function(path) {
      const baseName = Path.basename(path)
      return baseName !== 'd' && baseName !== 'g'
    })
    expect(results.files).toEqual([getFixturePath('validate/a'), getFixturePath('validate/b/c'), getFixturePath('validate/b/e/f')])
    expect(results.directories).toEqual([getFixturePath('validate'), getFixturePath('validate/b'), getFixturePath('validate/b/e')])
  })
})
