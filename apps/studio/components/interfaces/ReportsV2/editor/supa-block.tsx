'use client'
import { Node } from '@tiptap/core'
import { ReactNodeViewRenderer, NodeViewProps } from '@tiptap/react'
import { useState } from 'react'
import { NodeViewWrapper, mergeAttributes } from '@tiptap/react'
import { TiptapNodeViewProps } from './shared'
import DataGrid, { Column, RenderRowProps, Row } from 'react-data-grid'
import BarChart from 'components/ui/Charts/BarChart'
import { useParams } from 'common'
import { useProjectContext } from 'components/layouts/ProjectLayout/ProjectContext'
import { useExecuteSqlMutation } from 'data/sql/execute-sql-mutation'
import { Button, cn } from 'ui'
import CodeEditor from 'components/ui/CodeEditor/CodeEditor'
import { GenericSkeletonLoader } from 'ui-patterns'
import { RefreshCwIcon, Trash2Icon } from 'lucide-react'

function SQLTableComponent(props: TiptapNodeViewProps<{ sql: string; type: 'table' | 'chart' }>) {
  const {
    node: {
      attrs: { sql, type },
    },
  } = props

  const { project } = useProjectContext()

  const [innerSQL, setInnerSQL] = useState(sql)
  const [source, onSourceChange] = useState<'postgres' | 'logs'>('postgres')
  const [mode, setMode] = useState<'edit' | 'view'>('edit')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { mutate: runQuery, isLoading, data } = useExecuteSqlMutation()

  function execute(sql: string) {
    if (project) {
      runQuery({ sql, projectRef: project.ref, connectionString: project.connectionString })
    }
  }

  const columns = data?.result[0]
    ? Object.keys(data.result[0]).map((key) => ({ key, name: key }))
    : [{ key: 'id', name: 'id' }]

  return (
    <NodeViewWrapper>
      <div
        onClick={(e) => {
          e.stopPropagation()
        }}
        className="flex flex-col mt-8 group h-96"
      >
        <>
          {isLoading ? (
            <div className="flex-1 p-4 flex-flex-col border rounded-lg overflow-hidden">
              <GenericSkeletonLoader />
            </div>
          ) : (
            <div className="flex-1 flex-flex-col border rounded-lg overflow-hidden">
              {mode === 'edit' && (
                <CodeEditor
                  value={innerSQL}
                  onInputChange={(v) => setInnerSQL(v || '')}
                  className="flex-1"
                  id="sql-block"
                  language="pgsql"
                />
              )}
              {mode === 'view' && (
                <>
                  {type === 'table' && (
                    <div className="overflow-auto">
                      <DataGrid
                        className="border-none"
                        columns={columns}
                        rows={data?.result || []}
                      />
                    </div>
                  )}
                  {type === 'chart' && (
                    <BarChart
                      className="px-8 py-2"
                      data={data?.result}
                      xAxisKey={columns[0]?.key || ''}
                      yAxisKey={columns[1]?.key || ''}
                    />
                  )}
                </>
              )}
            </div>
          )}

          {/** ACTIONS */}
          <div
            className={cn(
              'flex gap-1 justify-end mt-1.5 group-hover:opacity-100 opacity-0 transition-all group-focus-within:opacity-100',
              {
                'opacity-100': mode === 'edit',
                'opacity-50 pointer-events-none': isLoading,
              }
            )}
          >
            {mode === 'edit' && (
              <>
                <Button
                  type="text"
                  size="tiny"
                  className=""
                  onClick={() => {
                    setMode('view')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="primary"
                  size="tiny"
                  className=""
                  onClick={() => {
                    setMode('view')
                    execute(innerSQL)
                  }}
                >
                  Save
                </Button>
              </>
            )}
            {mode === 'view' && (
              <>
                {showDeleteConfirm ? (
                  <div className="flex items-center text-xs text-foreground">
                    Are you sure?
                    <Button
                      type="text"
                      size="tiny"
                      className="ml-2"
                      onClick={() => setShowDeleteConfirm(false)}
                    >
                      No
                    </Button>
                    <Button
                      type="text"
                      size="tiny"
                      className=""
                      onClick={() => {
                        props.deleteNode()
                      }}
                    >
                      Yes
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="text"
                    size="tiny"
                    className=""
                    onClick={() => setShowDeleteConfirm(true)}
                    icon={<Trash2Icon className="w-4 h-4" />}
                  >
                    Delete
                  </Button>
                )}
                <Button
                  type="text"
                  onClick={() => {
                    execute(sql)
                  }}
                  icon={<RefreshCwIcon className="w-4 h-4" />}
                >
                  Refresh
                </Button>
                <Button
                  type="primary"
                  size="tiny"
                  className=""
                  onClick={() => {
                    setMode('edit')
                  }}
                >
                  Edit block
                </Button>
              </>
            )}
          </div>
        </>
      </div>
    </NodeViewWrapper>
  )
}

const name = 'supa-block'
export const SupaBlock = Node.create({
  name,
  group: 'block',

  addAttributes() {
    return {
      sql: {
        default: '',
      },
      type: {
        default: 'table',
      },
    }
  },

  parseHTML() {
    return [{ tag: name }]
  },

  renderHTML({ HTMLAttributes }) {
    return [name, mergeAttributes(HTMLAttributes)]
  },

  addNodeView() {
    return ReactNodeViewRenderer(SQLTableComponent)
  },
})
