import { useEffect, useState } from 'react';
import { useRoomStore } from '../../stores/roomStore';
import { useTemplateStore } from '../../stores/templateStore';

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function TemplatePanel() {
  const rooms = useRoomStore((state) => state.rooms);
  const selectedRoomId = useRoomStore((state) => state.selectedRoomId);
  const { templates, isLoading, error, fetchTemplates, saveTemplate, applyTemplate, deleteTemplate, renameTemplate } =
    useTemplateStore();

  const [showSaveForm, setShowSaveForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDesc, setTemplateDesc] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const currentRoom = rooms.find((r) => r.id === selectedRoomId);

  const handleSave = async () => {
    if (!templateName.trim()) return;
    await saveTemplate(templateName.trim(), templateDesc.trim() || undefined);
    setTemplateName('');
    setTemplateDesc('');
    setShowSaveForm(false);
  };

  const handleApply = async (templateId: string) => {
    await applyTemplate(templateId, selectedRoomId);
  };

  const startEdit = (id: string, name: string, desc?: string) => {
    setEditingId(id);
    setEditName(name);
    setEditDesc(desc ?? '');
  };

  const handleEditSave = async (id: string) => {
    if (!editName.trim()) return;
    await renameTemplate(id, editName.trim(), editDesc.trim() || undefined);
    setEditingId(null);
  };

  return (
    <div className="mt-6 border-t border-[var(--color-line)] pt-5">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">展厅模板</h3>
        <button
          type="button"
          onClick={() => setShowSaveForm((v) => !v)}
          className="rounded border border-[var(--color-line)] bg-[var(--color-panel)] px-3 py-1 text-sm hover:bg-[var(--color-line)]"
        >
          {showSaveForm ? '取消' : '保存当前为模板'}
        </button>
      </div>

      {showSaveForm && (
        <div className="mt-3 space-y-2 border border-[var(--color-line)] bg-[var(--color-bg)] p-3">
          <input
            type="text"
            placeholder="模板名称"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="w-full border border-[var(--color-line)] bg-[var(--color-panel)] p-2 text-sm"
          />
          <textarea
            placeholder="模板描述（可选）"
            value={templateDesc}
            onChange={(e) => setTemplateDesc(e.target.value)}
            rows={2}
            className="w-full border border-[var(--color-line)] bg-[var(--color-panel)] p-2 text-sm"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={!templateName.trim()}
            className="w-full rounded bg-[var(--color-ink)] p-2 text-sm text-[var(--color-paper)] disabled:opacity-40"
          >
            保存模板
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}

      <div className="mt-3 space-y-2">
        {isLoading && <p className="text-sm text-[var(--color-muted)]">加载中...</p>}
        {!isLoading && templates.length === 0 && (
          <p className="text-sm text-[var(--color-muted)]">还没有保存的模板。调整好展厅后点击上方按钮保存。</p>
        )}
        {templates.map((tpl) => (
          <div key={tpl.id} className="border border-[var(--color-line)] bg-[var(--color-panel)] p-3">
            {editingId === tpl.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-[var(--color-line)] bg-[var(--color-bg)] p-2 text-sm"
                />
                <textarea
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={2}
                  placeholder="描述"
                  className="w-full border border-[var(--color-line)] bg-[var(--color-bg)] p-2 text-sm"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleEditSave(tpl.id)}
                    className="flex-1 rounded bg-[var(--color-ink)] p-1.5 text-xs text-[var(--color-paper)]"
                  >
                    保存
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="flex-1 rounded border border-[var(--color-line)] p-1.5 text-xs"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{tpl.name}</p>
                    {tpl.description && <p className="mt-1 text-xs text-[var(--color-muted)]">{tpl.description}</p>}
                    <p className="mt-1 text-xs text-[var(--color-muted)]">
                      {tpl.roomType} · {tpl.artworkPlacements.length} 件作品 · {formatDate(tpl.createdAt)}
                    </p>
                  </div>
                  <span
                    className="inline-block h-6 w-6 shrink-0 rounded border border-[var(--color-line)]"
                    style={{ backgroundColor: tpl.roomSnapshot.wallColor }}
                    title="墙面颜色"
                  />
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleApply(tpl.id)}
                    disabled={!currentRoom}
                    className="flex-1 rounded bg-[var(--color-ink)] p-1.5 text-xs text-[var(--color-paper)] disabled:opacity-40"
                  >
                    套用到当前展厅
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(tpl.id, tpl.name, tpl.description)}
                    className="rounded border border-[var(--color-line)] px-3 p-1.5 text-xs hover:bg-[var(--color-line)]"
                  >
                    编辑
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteTemplate(tpl.id)}
                    className="rounded border border-red-300 px-3 p-1.5 text-xs text-red-600 hover:bg-red-50"
                  >
                    删除
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
