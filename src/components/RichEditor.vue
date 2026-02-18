<template>
  <div class="rich-editor">
    <!-- Toolbar -->
    <div class="editor-toolbar" v-if="editor" role="toolbar" aria-label="Editor formatting">
      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('bold') }"
          :aria-pressed="editor.isActive('bold')"
          @click="editor.chain().focus().toggleBold().run()"
          aria-label="Bold"
          title="Bold"
        >B</button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('italic') }"
          :aria-pressed="editor.isActive('italic')"
          @click="editor.chain().focus().toggleItalic().run()"
          aria-label="Italic"
          title="Italic"
        ><em>I</em></button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('underline') }"
          :aria-pressed="editor.isActive('underline')"
          @click="editor.chain().focus().toggleUnderline().run()"
          aria-label="Underline"
          title="Underline"
        ><u>U</u></button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('strike') }"
          :aria-pressed="editor.isActive('strike')"
          @click="editor.chain().focus().toggleStrike().run()"
          aria-label="Strikethrough"
          title="Strikethrough"
        ><s>S</s></button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('heading', { level: 1 }) }"
          :aria-pressed="editor.isActive('heading', { level: 1 })"
          @click="editor.chain().focus().toggleHeading({ level: 1 }).run()"
          aria-label="Heading 1"
          title="Heading 1"
        >H1</button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('heading', { level: 2 }) }"
          :aria-pressed="editor.isActive('heading', { level: 2 })"
          @click="editor.chain().focus().toggleHeading({ level: 2 }).run()"
          aria-label="Heading 2"
          title="Heading 2"
        >H2</button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('heading', { level: 3 }) }"
          :aria-pressed="editor.isActive('heading', { level: 3 })"
          @click="editor.chain().focus().toggleHeading({ level: 3 }).run()"
          aria-label="Heading 3"
          title="Heading 3"
        >H3</button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('bulletList') }"
          :aria-pressed="editor.isActive('bulletList')"
          @click="editor.chain().focus().toggleBulletList().run()"
          aria-label="Bullet list"
          title="Bullet List"
        >•</button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('orderedList') }"
          :aria-pressed="editor.isActive('orderedList')"
          @click="editor.chain().focus().toggleOrderedList().run()"
          aria-label="Numbered list"
          title="Ordered List"
        >1.</button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('blockquote') }"
          :aria-pressed="editor.isActive('blockquote')"
          @click="editor.chain().focus().toggleBlockquote().run()"
          aria-label="Blockquote"
          title="Blockquote"
        >❝</button>
        <button
          type="button"
          class="toolbar-btn"
          :class="{ active: editor.isActive('codeBlock') }"
          :aria-pressed="editor.isActive('codeBlock')"
          @click="editor.chain().focus().toggleCodeBlock().run()"
          aria-label="Code block"
          title="Code Block"
        >{ }</button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          @click="addLink"
          :class="{ active: editor.isActive('link') }"
          :aria-pressed="editor.isActive('link')"
          aria-label="Add link"
          title="Add Link"
        >🔗</button>
        <button
          type="button"
          class="toolbar-btn"
          @click="triggerImageUpload"
          :disabled="uploading"
          aria-label="Upload image"
          title="Upload Image"
        >
          <span class="spinner" v-if="uploading" style="width:14px;height:14px;" aria-hidden="true"></span>
          <span v-else aria-hidden="true">🖼️</span>
        </button>
      </div>

      <div class="toolbar-divider"></div>

      <div class="toolbar-group">
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().setHorizontalRule().run()"
          aria-label="Horizontal rule"
          title="Horizontal Rule"
        >—</button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().undo().run()"
          :disabled="!editor.can().undo()"
          aria-label="Undo"
          title="Undo"
        >↩</button>
        <button
          type="button"
          class="toolbar-btn"
          @click="editor.chain().focus().redo().run()"
          :disabled="!editor.can().redo()"
          aria-label="Redo"
          title="Redo"
        >↪</button>
      </div>
    </div>

    <!-- Editor Content -->
    <editor-content :editor="editor" class="editor-content" />

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      style="display: none;"
      @change="handleImageUpload"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { useEditor, EditorContent } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import Underline from '@tiptap/extension-underline'
import api from '../api/axios'
import { useToast } from '../composables/useToast'

const props = defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const uploading = ref(false)
const toast = useToast()

const editor = useEditor({
  content: props.modelValue || '',
  extensions: [
    StarterKit,
    Underline,
    Image.configure({
      inline: false,
      allowBase64: false,
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    Link.configure({
      openOnClick: false,
      HTMLAttributes: {
        class: 'editor-link',
      },
    }),
    Placeholder.configure({
      placeholder: props.placeholder || 'Start writing...',
    }),
  ],
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

// Sync external modelValue changes into editor
watch(
  () => props.modelValue,
  (newVal) => {
    if (editor.value && editor.value.getHTML() !== newVal) {
      editor.value.commands.setContent(newVal || '', { emitUpdate: false })
    }
  }
)

onBeforeUnmount(() => {
  editor.value?.destroy()
})

function addLink() {
  if (!editor.value) return

  if (editor.value.isActive('link')) {
    editor.value.chain().focus().unsetLink().run()
    return
  }

  const url = window.prompt('Enter URL:')
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run()
  }
}

function triggerImageUpload() {
  fileInput.value?.click()
}

async function handleImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !editor.value) return

  uploading.value = true
  try {
    const { data } = await api.post('/admin/images/upload', (() => {
      const fd = new FormData()
      fd.append('file', file)
      return fd
    })(), {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // The API response may be wrapped: { success, data: { file_path } }
    const filePath = data?.data?.file_path || data?.file_path || data?.FilePath
    if (filePath) {
      const imageUrl = filePath.startsWith('http')
        ? filePath
        : `http://localhost:8080/${filePath.replace(/^\//, '')}`

      editor.value.chain().focus().setImage({ src: imageUrl }).run()
      toast.success('Image inserted successfully')
    }
  } catch (err: any) {
    const msg = err?.response?.data?.error || err?.response?.data?.message || 'Image upload failed. Please try again.'
    toast.error(msg)
  } finally {
    uploading.value = false
    input.value = '' // Reset for re-upload
  }
}
</script>

<style scoped>
.rich-editor {
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background: var(--bg-input);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.rich-editor:focus-within {
  border-color: var(--accent-primary);
  box-shadow: var(--focus-ring);
}

/* Toolbar */
.editor-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: var(--space-xs) var(--space-sm);
  background: var(--bg-tertiary);
  border-bottom: 1px solid var(--border-color);
}

.toolbar-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background: var(--border-color);
  margin: 0 4px;
}

.toolbar-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.8rem;
  font-weight: 600;
  font-family: var(--font-family);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.toolbar-btn:hover:not(:disabled) {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.toolbar-btn.active {
  background: var(--accent-primary-muted);
  color: var(--accent-primary);
}

.toolbar-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .toolbar-btn {
    width: 44px;
    height: 44px;
  }
}

/* Editor Content Area */
.editor-content {
  min-height: 250px;
  max-height: 400px;
  overflow-y: auto;
}

.editor-content :deep(.tiptap) {
  padding: var(--space-md);
  min-height: 250px;
  outline: none;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--text-primary);
}

.editor-content :deep(.tiptap p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: var(--text-muted);
  pointer-events: none;
  height: 0;
}

/* Typography inside editor */
.editor-content :deep(.tiptap h1) {
  font-size: 1.6rem;
  font-weight: 700;
  margin: 1rem 0 0.5rem;
}

.editor-content :deep(.tiptap h2) {
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0.8rem 0 0.4rem;
}

.editor-content :deep(.tiptap h3) {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0.6rem 0 0.3rem;
}

.editor-content :deep(.tiptap p) {
  margin: 0.4rem 0;
}

.editor-content :deep(.tiptap ul),
.editor-content :deep(.tiptap ol) {
  padding-left: 1.5rem;
  margin: 0.4rem 0;
}

.editor-content :deep(.tiptap blockquote) {
  border-left: 3px solid var(--accent-primary);
  padding-left: var(--space-md);
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-style: italic;
}

.editor-content :deep(.tiptap pre) {
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  overflow-x: auto;
  margin: 0.5rem 0;
}

.editor-content :deep(.tiptap code) {
  background: var(--bg-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.85em;
}

.editor-content :deep(.tiptap pre code) {
  background: none;
  padding: 0;
}

.editor-content :deep(.tiptap hr) {
  border: none;
  border-top: 1px solid var(--border-color);
  margin: 1rem 0;
}

.editor-content :deep(.tiptap a) {
  color: var(--accent-primary);
  text-decoration: underline;
  cursor: pointer;
}

.editor-content :deep(.tiptap img.editor-image) {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md);
  margin: 0.5rem 0;
  border: 1px solid var(--border-color);
}
</style>
