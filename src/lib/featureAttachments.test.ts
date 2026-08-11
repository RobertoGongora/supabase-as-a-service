import { describe, expect, it } from 'vitest'
import {
  addAttachments,
  filterLibraryFiles,
  isAttachableFile,
  libraryAttachment,
  libraryKey,
  removeAttachment,
  screenshotPath,
  uploadAttachments,
  type LibraryFile,
} from './featureAttachments'

const row = (over: Partial<LibraryFile> = {}): LibraryFile => ({
  id: 'f1',
  name: 'shot.png',
  title: null,
  path: 'u1/shot.png',
  mime_type: 'image/png',
  bucket: 'files',
  ...over,
})

const asFile = (name: string, type: string) => new File(['x'], name, { type })

describe('isAttachableFile', () => {
  it('accepts images in the private files bucket', () => {
    expect(isAttachableFile(row())).toBe(true)
    expect(isAttachableFile(row({ mime_type: null, name: 'diagram.JPEG' }))).toBe(true)
    expect(isAttachableFile(row({ bucket: null }))).toBe(true)
  })

  it('rejects non-images and files outside the files bucket', () => {
    expect(isAttachableFile(row({ mime_type: 'application/pdf', name: 'spec.pdf' }))).toBe(false)
    expect(isAttachableFile(row({ bucket: 'public-files' }))).toBe(false)
  })
})

describe('filterLibraryFiles', () => {
  const rows = [
    row({ id: 'a', name: 'login-bug.png', title: 'Login bug' }),
    row({ id: 'b', name: 'notes.txt', mime_type: 'text/plain' }),
    row({ id: 'c', name: 'kanban.png', title: null }),
  ]

  it('keeps only attachable rows', () => {
    expect(filterLibraryFiles(rows).map((r) => r.id)).toEqual(['a', 'c'])
  })

  it('narrows to a collection when file ids are given', () => {
    expect(filterLibraryFiles(rows, { fileIds: new Set(['c']) }).map((r) => r.id)).toEqual(['c'])
    expect(filterLibraryFiles(rows, { fileIds: new Set(['b']) })).toEqual([])
  })

  it('searches name and title case-insensitively', () => {
    expect(filterLibraryFiles(rows, { search: '  LOGIN ' }).map((r) => r.id)).toEqual(['a'])
    expect(filterLibraryFiles(rows, { search: 'kan' }).map((r) => r.id)).toEqual(['c'])
    expect(filterLibraryFiles(rows, { search: 'nothing' })).toEqual([])
  })
})

describe('libraryAttachment', () => {
  it('reuses the existing path and prefers the title as the label', () => {
    expect(libraryAttachment(row({ title: 'Login bug' }))).toEqual({
      kind: 'library',
      key: libraryKey('u1/shot.png'),
      name: 'Login bug',
      path: 'u1/shot.png',
    })
  })

  it('falls back to the filename when the title is blank', () => {
    expect(libraryAttachment(row({ title: '   ' })).name).toBe('shot.png')
  })
})

describe('uploadAttachments', () => {
  it('keeps images and sanitizes their names', () => {
    const staged = uploadAttachments(
      [asFile('Screenshot 2026-08-11 at 19.44.png', 'image/png'), asFile('notes.txt', 'text/plain')],
      'seed',
    )
    expect(staged).toHaveLength(1)
    expect(staged[0].kind).toBe('upload')
    expect(staged[0].name).toBe('Screenshot_2026-08-11_at_19.44.png')
  })

  it('gives every staged file a distinct key', () => {
    const staged = uploadAttachments([asFile('a.png', 'image/png'), asFile('b.png', 'image/png')], 'seed')
    expect(new Set(staged.map((a) => a.key)).size).toBe(2)
  })

  it('names a nameless pasted screenshot', () => {
    expect(uploadAttachments([asFile('', 'image/png')], 'seed')[0].name).toBe('image.png')
  })
})

describe('addAttachments', () => {
  it('appends new attachments', () => {
    const first = libraryAttachment(row({ path: 'u1/a.png' }))
    const second = libraryAttachment(row({ id: 'f2', path: 'u1/b.png' }))
    expect(addAttachments([first], [second]).map((a) => a.key)).toEqual([first.key, second.key])
  })

  it('ignores a file already staged (same path picked twice)', () => {
    const one = libraryAttachment(row())
    expect(addAttachments([one], [libraryAttachment(row())])).toEqual([one])
  })

  it('dedupes within the incoming batch too', () => {
    const one = libraryAttachment(row())
    expect(addAttachments([], [one, { ...one }])).toHaveLength(1)
  })
})

describe('removeAttachment', () => {
  it('drops only the matching key', () => {
    const a = libraryAttachment(row({ path: 'u1/a.png' }))
    const b = libraryAttachment(row({ path: 'u1/b.png' }))
    expect(removeAttachment([a, b], a.key)).toEqual([b])
  })
})

describe('screenshotPath', () => {
  it('stores under the uploader folder with a unique segment', () => {
    expect(screenshotPath('user-1', 'my shot.png', 'abc')).toBe('user-1/features/abc-my_shot.png')
  })

  it('keeps two same-named pastes apart', () => {
    expect(screenshotPath('u', 'image.png', 'k1')).not.toBe(screenshotPath('u', 'image.png', 'k2'))
  })

  it('adds an extension from the mime type when the name has none', () => {
    expect(screenshotPath('u', 'clip', 'k', 'image/jpeg')).toBe('u/features/k-clip.jpg')
  })
})
