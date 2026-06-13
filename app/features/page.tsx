'use client'

import { useServerAction } from '@yedoma-labs/sir-forms'
import { useState, useEffect, useRef } from 'react'
import {
  computed,
  crossTabSync,
  createSnapshots,
  createOptimisticUpdates,
  createStore,
  createHistoryBranching,
  createBatcher,
  subscribeToField,
} from '@yedoma-labs/ichchi-state'
import { formStore, useFormState } from '@/lib/formStore'
import { incrementLikes, addTodoOptimistic } from './actions'
import { storeLogger } from '@/lib/clientLogger'
import Link from 'next/link'

// ─── Module-level setup (unchanged) ─────────────────────────────────────────

const submissionStats = computed(formStore, (state) => ({
  hasSubmissions: state.submissionCount > 0,
  isActive: state.submissionCount >= 3,
  lastWeek: state.recentSubmissions.filter(s => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
    return new Date(s.timestamp).getTime() > weekAgo
  }).length,
}))

if (typeof window !== 'undefined') {
  crossTabSync(formStore, { key: 'yedoma-labs-demo-sync', syncDelay: 100 })
}

const snapshots = createSnapshots(formStore)
const optimistic = createOptimisticUpdates(formStore)

// ─── Feature Components ──────────────────────────────────────────────────────

function LikeButton() {
  const [likes, setLikes] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const executeAction = useServerAction(incrementLikes)

  const handleLike = async () => {
    setLoading(true)
    setError(null)
    const result = await executeAction({ count: likes })
    setLoading(false)
    if (result.success && result.data) {
      setLikes(result.data.count)
    } else if (result.error) {
      setError(result.error)
    }
  }

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b',height:'100%' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#a78bfa',fontSize:'0.7rem',fontWeight:700 }}>useServerAction</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>🚀 Server Action Hook</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1.25rem',lineHeight:1.5 }}>
        Wrapped server action with automatic error boundary and loading state.
      </p>
      <div style={{ display:'flex',alignItems:'center',gap:'1rem' }}>
        <button
          type="button"
          onClick={handleLike}
          disabled={loading}
          style={{
            padding:'0.75rem 1.5rem',fontSize:'1.25rem',
            background:'linear-gradient(135deg,#6366f1,#8b5cf6)',color:'white',
            border:'none',borderRadius:'10px',cursor:loading ? 'not-allowed' : 'pointer',
            opacity:loading ? 0.6 : 1,fontWeight:700,
          }}
        >
          {loading ? '⏳' : '👍'} {likes}
        </button>
        {loading && <span style={{ color:'#64748b',fontSize:'0.8rem' }}>Loading…</span>}
      </div>
      {error && <div style={{ color:'#ef4444',marginTop:'0.75rem',fontSize:'0.8rem' }}>Error: {error}</div>}
    </div>
  )
}

function ComputedStats() {
  const [stats, setStats] = useState(submissionStats.get())
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const unsub = submissionStats.subscribe(setStats)
    return unsub
  }, [])

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b',height:'100%' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(16,185,129,0.12)',border:'1px solid rgba(16,185,129,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#34d399',fontSize:'0.7rem',fontWeight:700 }}>computed()</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>🧮 Computed Values</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1.25rem',lineHeight:1.5 }}>
        Auto-updating derived state from formStore — updates whenever the store changes.
      </p>
      {!mounted ? (
        <p style={{ color:'#334155',fontSize:'0.8rem' }}>Loading…</p>
      ) : (
        <div style={{ display:'flex',flexDirection:'column',gap:'0.5rem' }}>
          {[
            { label:'Has submissions',         value: stats.hasSubmissions ? '✅ Yes' : '❌ No',       color: stats.hasSubmissions ? '#10b981' : '#475569' },
            { label:'Active user (3+)',         value: stats.isActive ? '🔥 Yes' : '❌ No',           color: stats.isActive ? '#f59e0b' : '#475569' },
            { label:'Submissions this week',    value: String(stats.lastWeek),                        color: '#a78bfa' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',background:'#1e293b',borderRadius:'6px',padding:'0.5rem 0.75rem' }}>
              <span style={{ color:'#64748b',fontSize:'0.78rem' }}>{label}</span>
              <span style={{ color,fontSize:'0.82rem',fontWeight:700,fontFamily:'monospace' }}>{value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function TimeTravelDebugger() {
  const [snapshotList, setSnapshotList] = useState<any[]>([])

  const createSnapshot = () => {
    const id = `snapshot-${Date.now()}`
    snapshots.create(id, `Manual snapshot at ${new Date().toLocaleTimeString()}`)
    setSnapshotList(snapshots.list())
  }

  const restore = (id: string) => {
    if (snapshots.restore(id)) alert(`Restored to snapshot: ${id}`)
  }

  const showDiff = (id: string) => {
    const diff = snapshots.diff(id)
    storeLogger.info('Snapshot diff', { diff })
    alert(`Check console for diff from snapshot ${id}`)
  }

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b',height:'100%' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#fbbf24',fontSize:'0.7rem',fontWeight:700 }}>createSnapshots()</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>⏱️ Time-Travel Debugging</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1.25rem',lineHeight:1.5 }}>
        Snapshot and restore state at any point in time.
      </p>
      <button
        type="button"
        onClick={createSnapshot}
        style={{ background:'linear-gradient(135deg,#78350f,#f59e0b)',color:'white',border:'none',borderRadius:'8px',padding:'0.55rem 1.1rem',fontSize:'0.8rem',fontWeight:700,cursor:'pointer',marginBottom:'1rem' }}
      >
        📸 Create Snapshot
      </button>
      <div style={{ maxHeight:'200px',overflowY:'auto',display:'flex',flexDirection:'column',gap:'0.4rem' }}>
        {snapshotList.length === 0 ? (
          <p style={{ color:'#334155',fontSize:'0.78rem' }}>No snapshots yet. Create one above!</p>
        ) : snapshotList.map((snap) => (
          <div key={snap.id} style={{ background:'#1e293b',borderRadius:'6px',padding:'0.6rem 0.75rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'0.75rem' }}>
            <div>
              <div style={{ color:'#e2e8f0',fontSize:'0.78rem',fontWeight:600 }}>{snap.label}</div>
              <div style={{ color:'#475569',fontSize:'0.65rem',fontFamily:'monospace' }}>{new Date(snap.timestamp).toLocaleString()}</div>
            </div>
            <div style={{ display:'flex',gap:'0.4rem',flexShrink:0 }}>
              <button type="button" onClick={() => restore(snap.id)} style={{ padding:'0.2rem 0.5rem',background:'rgba(16,185,129,0.2)',border:'1px solid rgba(16,185,129,0.4)',borderRadius:'4px',color:'#10b981',fontSize:'0.65rem',cursor:'pointer' }}>↩️ Restore</button>
              <button type="button" onClick={() => showDiff(snap.id)}  style={{ padding:'0.2rem 0.5rem',background:'rgba(99,102,241,0.2)',border:'1px solid rgba(99,102,241,0.4)',borderRadius:'4px',color:'#a78bfa',fontSize:'0.65rem',cursor:'pointer' }}>🔍 Diff</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function OptimisticTodoList() {
  const [todos, setTodos] = useState<string[]>([])
  const [newTodo, setNewTodo] = useState('')
  const [pending, setPending] = useState<Set<string>>(new Set())

  const addTodo = async () => {
    if (!newTodo.trim()) return
    const id = `todo-${Date.now()}`
    setPending(prev => new Set(prev).add(id))
    setTodos(prev => [...prev, newTodo])
    const todoText = newTodo
    setNewTodo('')
    try {
      await optimistic.optimistic(
        id,
        (state) => ({ ...state }),
        async () => {
          const result = await addTodoOptimistic({ text: todoText })
          if (!result.success) throw new Error('Failed to add todo')
          return result
        },
      )
      setPending(prev => { const n = new Set(prev); n.delete(id); return n })
    } catch {
      setTodos(prev => prev.filter(t => t !== todoText))
      setPending(prev => { const n = new Set(prev); n.delete(id); return n })
      alert('Failed to add todo — rolled back')
    }
  }

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b',height:'100%' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#c4b5fd',fontSize:'0.7rem',fontWeight:700 }}>optimistic()</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>⚡ Optimistic Updates</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1.25rem',lineHeight:1.5 }}>
        Instant UI updates with automatic rollback on failure.
      </p>
      <div style={{ display:'flex',gap:'0.5rem',marginBottom:'1rem' }}>
        <input
          type="text"
          value={newTodo}
          onChange={e => setNewTodo(e.target.value)}
          placeholder="New todo…"
          onKeyDown={e => e.key === 'Enter' && addTodo()}
          style={{ flex:1,padding:'0.55rem 0.75rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'7px',color:'#e2e8f0',fontSize:'0.85rem' }}
        />
        <button type="button" onClick={addTodo} style={{ padding:'0.55rem 1rem',background:'linear-gradient(135deg,#4c1d95,#8b5cf6)',color:'white',border:'none',borderRadius:'7px',cursor:'pointer',fontSize:'0.85rem',fontWeight:700,flexShrink:0 }}>Add</button>
      </div>
      <div style={{ display:'flex',flexDirection:'column',gap:'0.4rem',maxHeight:180,overflowY:'auto' }}>
        {todos.length === 0 ? (
          <p style={{ color:'#334155',fontSize:'0.78rem' }}>No todos yet. Add one above!</p>
        ) : todos.map((todo, idx) => (
          <div key={idx} style={{ background:'#1e293b',borderRadius:'6px',padding:'0.5rem 0.75rem',display:'flex',alignItems:'center',gap:'0.5rem',opacity:pending.size > 0 ? 0.7 : 1,transition:'opacity 0.2s' }}>
            <span style={{ color:'#a78bfa',fontSize:'0.65rem' }}>●</span>
            <span style={{ color:'#e2e8f0',fontSize:'0.82rem' }}>{todo}</span>
            {pending.size > 0 && <span style={{ marginLeft:'auto',color:'#64748b',fontSize:'0.7rem' }}>⏳</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── New Showcase Components ─────────────────────────────────────────────────

function HistoryBranchingDemo() {
  const [count, setCount] = useState(0)
  const [branches, setBranches] = useState<string[]>(['main'])
  const [currentBranch, setCurrentBranch] = useState('main')
  const [tree, setTree] = useState('')
  const [newBranchName, setNewBranchName] = useState('')
  const storeRef = useRef<ReturnType<typeof createStore<{ count: number }>> | null>(null)
  const branchingRef = useRef<ReturnType<typeof createHistoryBranching> | null>(null)

  useEffect(() => {
    const store = createStore({ count: 0 })
    const branching = createHistoryBranching(store)
    storeRef.current = store
    branchingRef.current = branching
    const refresh = () => {
      setCount(store.getState().count)
      setBranches(branching.getBranches().map((b: any) => b.name))
      setCurrentBranch(branching.getCurrentBranch())
      setTree(branching.visualize())
    }
    const unsub = store.subscribe(refresh)
    refresh()
    return () => { unsub(); branching.destroy() }
  }, [])

  const inc = () => storeRef.current?.setState((s: any) => ({ count: s.count + 1 }))
  const dec = () => storeRef.current?.setState((s: any) => ({ count: s.count - 1 }))
  const back = () => { branchingRef.current?.back(); setCount(storeRef.current?.getState().count ?? 0); setTree(branchingRef.current?.visualize() ?? '') }
  const fwd = () => { branchingRef.current?.forward(); setCount(storeRef.current?.getState().count ?? 0); setTree(branchingRef.current?.visualize() ?? '') }
  const branch = () => {
    const name = newBranchName.trim() || `branch-${Date.now().toString(36)}`
    branchingRef.current?.createBranch(name)
    branchingRef.current?.checkout(name)
    setNewBranchName('')
    setBranches(branchingRef.current?.getBranches().map((b: any) => b.name) ?? [])
    setCurrentBranch(branchingRef.current?.getCurrentBranch() ?? 'main')
    setTree(branchingRef.current?.visualize() ?? '')
    setCount(storeRef.current?.getState().count ?? 0)
  }

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#818cf8',fontSize:'0.7rem',fontWeight:700 }}>createHistoryBranching()</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>🌿 Git-like State History</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1rem',lineHeight:1.5 }}>
        Branch, checkout, and time-travel through state — just like git.
      </p>
      <div style={{ display:'flex',alignItems:'center',gap:'0.6rem',marginBottom:'1rem',flexWrap:'wrap' }}>
        <button type="button" onClick={dec} style={{ width:32,height:32,background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'7px',color:'#ef4444',fontSize:'1rem',fontWeight:900,cursor:'pointer' }}>−</button>
        <span style={{ color:'#e2e8f0',fontSize:'1.6rem',fontWeight:900,fontFamily:'monospace',minWidth:36,textAlign:'center' }}>{count}</span>
        <button type="button" onClick={inc} style={{ width:32,height:32,background:'rgba(16,185,129,0.15)',border:'1px solid rgba(16,185,129,0.3)',borderRadius:'7px',color:'#10b981',fontSize:'1rem',fontWeight:900,cursor:'pointer' }}>+</button>
        <div style={{ width:1,height:20,background:'#1e293b',margin:'0 0.1rem' }} />
        <button type="button" onClick={back} style={{ padding:'0.25rem 0.6rem',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'5px',color:'#818cf8',fontSize:'0.72rem',cursor:'pointer' }}>← back</button>
        <button type="button" onClick={fwd} style={{ padding:'0.25rem 0.6rem',background:'rgba(99,102,241,0.12)',border:'1px solid rgba(99,102,241,0.3)',borderRadius:'5px',color:'#818cf8',fontSize:'0.72rem',cursor:'pointer' }}>fwd →</button>
      </div>
      <div style={{ display:'flex',gap:'0.4rem',marginBottom:'0.75rem' }}>
        <input type="text" value={newBranchName} onChange={e => setNewBranchName(e.target.value)} placeholder="branch name…"
          onKeyDown={e => e.key === 'Enter' && branch()}
          style={{ flex:1,padding:'0.35rem 0.55rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'6px',color:'#e2e8f0',fontSize:'0.75rem' }} />
        <button type="button" onClick={branch} style={{ padding:'0.35rem 0.75rem',background:'linear-gradient(135deg,#3730a3,#6366f1)',color:'white',border:'none',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',flexShrink:0 }}>Branch</button>
      </div>
      <div style={{ display:'flex',gap:'0.35rem',flexWrap:'wrap',marginBottom:'0.75rem' }}>
        {branches.map(br => (
          <button key={br} type="button"
            onClick={() => { branchingRef.current?.checkout(br); setCurrentBranch(br); setCount(storeRef.current?.getState().count ?? 0); setTree(branchingRef.current?.visualize() ?? '') }}
            style={{ padding:'0.2rem 0.6rem',borderRadius:'5px',fontSize:'0.68rem',fontWeight:700,cursor:'pointer',
              background: br === currentBranch ? 'rgba(99,102,241,0.25)' : 'rgba(30,41,59,0.8)',
              border: br === currentBranch ? '1px solid #6366f1' : '1px solid #334155',
              color: br === currentBranch ? '#818cf8' : '#64748b' }}
          >{br === currentBranch ? '● ' : ''}{br}</button>
        ))}
      </div>
      {tree && (
        <pre style={{ background:'#020817',borderRadius:'8px',padding:'0.75rem',fontSize:'0.68rem',color:'#10b981',fontFamily:'monospace',margin:0,lineHeight:1.5,maxHeight:130,overflowY:'auto' }}>{tree}</pre>
      )}
    </div>
  )
}

function FieldSubscriptionDemo() {
  type FState = { name: string; score: number; active: boolean }
  const storeRef = useRef<ReturnType<typeof createStore<FState>> | null>(null)
  const [values, setValues] = useState<FState>({ name: '', score: 0, active: false })
  const [log, setLog] = useState<{ field: string; value: string; ts: string }[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const store = createStore<FState>({ name: '', score: 0, active: false })
    storeRef.current = store
    setMounted(true)
    const addLog = (field: string, value: unknown) =>
      setLog(l => [{ field, value: String(value), ts: new Date().toLocaleTimeString() }, ...l].slice(0, 10))

    const u1 = subscribeToField(store, 'name', (v: string) => { addLog('name', v); setValues(s => ({ ...s, name: v })) })
    const u2 = subscribeToField(store, 'score', (v: number) => { addLog('score', v); setValues(s => ({ ...s, score: v })) })
    const u3 = subscribeToField(store, 'active', (v: boolean) => { addLog('active', v); setValues(s => ({ ...s, active: v })) })
    return () => { u1(); u2(); u3() }
  }, [])

  const set = (patch: Partial<FState>) => storeRef.current?.setState((s: FState) => ({ ...s, ...patch }))

  const fieldColors: Record<string, string> = { name: '#a78bfa', score: '#34d399', active: '#fb923c' }

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(6,182,212,0.12)',border:'1px solid rgba(6,182,212,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#22d3ee',fontSize:'0.7rem',fontWeight:700 }}>subscribeToField()</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>🎯 Per-Field Subscriptions</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1rem',lineHeight:1.5 }}>
        Each field has its own subscriber — fires only when that field changes.
      </p>
      {!mounted ? <p style={{ color:'#334155',fontSize:'0.8rem' }}>Loading…</p> : (
        <>
          <div style={{ display:'flex',flexDirection:'column',gap:'0.45rem',marginBottom:'1rem' }}>
            <div style={{ display:'flex',gap:'0.5rem',alignItems:'center' }}>
              <label style={{ color:'#64748b',fontSize:'0.7rem',width:40,flexShrink:0,fontFamily:'monospace' }}>name</label>
              <input type="text" value={values.name} onChange={e => set({ name: e.target.value })} placeholder="type something…"
                style={{ flex:1,padding:'0.32rem 0.55rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'6px',color:'#e2e8f0',fontSize:'0.78rem' }} />
            </div>
            <div style={{ display:'flex',gap:'0.5rem',alignItems:'center' }}>
              <label style={{ color:'#64748b',fontSize:'0.7rem',width:40,flexShrink:0,fontFamily:'monospace' }}>score</label>
              <input type="number" value={values.score} onChange={e => set({ score: Number(e.target.value) })}
                style={{ flex:1,padding:'0.32rem 0.55rem',background:'#1e293b',border:'1px solid #334155',borderRadius:'6px',color:'#e2e8f0',fontSize:'0.78rem' }} />
            </div>
            <div style={{ display:'flex',gap:'0.5rem',alignItems:'center' }}>
              <label style={{ color:'#64748b',fontSize:'0.7rem',width:40,flexShrink:0,fontFamily:'monospace' }}>active</label>
              <button type="button" onClick={() => set({ active: !values.active })}
                style={{ padding:'0.25rem 0.8rem',borderRadius:'6px',fontSize:'0.75rem',fontWeight:700,cursor:'pointer',
                  background: values.active ? 'rgba(16,185,129,0.2)' : 'rgba(30,41,59,0.8)',
                  border: values.active ? '1px solid #10b981' : '1px solid #334155',
                  color: values.active ? '#10b981' : '#475569' }}>
                {values.active ? 'true' : 'false'}
              </button>
            </div>
          </div>
          <div style={{ fontSize:'0.65rem',color:'#334155',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.1em',marginBottom:'0.35rem' }}>field change log</div>
          <div style={{ display:'flex',flexDirection:'column',gap:'0.2rem',maxHeight:130,overflowY:'auto' }}>
            {log.length === 0
              ? <p style={{ color:'#334155',fontSize:'0.72rem' }}>Edit a field above to see targeted notifications…</p>
              : log.map((e, i) => (
                <div key={i} style={{ display:'flex',gap:'0.5rem',alignItems:'center',background:'#1e293b',borderRadius:'4px',padding:'0.2rem 0.5rem' }}>
                  <span style={{ color: fieldColors[e.field] ?? '#94a3b8',fontSize:'0.65rem',fontFamily:'monospace',width:36,flexShrink:0 }}>{e.field}</span>
                  <span style={{ color:'#475569',fontSize:'0.6rem' }}>→</span>
                  <span style={{ color:'#e2e8f0',fontSize:'0.65rem',fontFamily:'monospace',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap' }}>{e.value}</span>
                  <span style={{ color:'#334155',fontSize:'0.6rem',flexShrink:0 }}>{e.ts}</span>
                </div>
              ))}
          </div>
        </>
      )}
    </div>
  )
}

function BatchUpdateDemo() {
  type BState = { x: number; y: number; z: number }
  const normalStoreRef = useRef<ReturnType<typeof createStore<BState>> | null>(null)
  const batchedStoreRef = useRef<ReturnType<typeof createStore<BState>> | null>(null)
  const batcherRef = useRef<ReturnType<typeof createBatcher> | null>(null)
  const [normalState, setNormalState] = useState<BState>({ x: 0, y: 0, z: 0 })
  const [batchedState, setBatchedState] = useState<BState>({ x: 0, y: 0, z: 0 })
  const [normalNotifs, setNormalNotifs] = useState(0)
  const [batchedNotifs, setBatchedNotifs] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const ns = createStore<BState>({ x: 0, y: 0, z: 0 })
    const bs = createStore<BState>({ x: 0, y: 0, z: 0 })
    const batcher = createBatcher(bs)
    normalStoreRef.current = ns
    batchedStoreRef.current = bs
    batcherRef.current = batcher
    setMounted(true)
    const u1 = ns.subscribe((s: BState) => { setNormalState(s); setNormalNotifs(n => n + 1) })
    const u2 = bs.subscribe((s: BState) => { setBatchedState(s); setBatchedNotifs(n => n + 1) })
    return () => { u1(); u2() }
  }, [])

  const updateNormal = () => {
    const s = normalStoreRef.current!
    s.setState((st: BState) => ({ ...st, x: st.x + 1 }))
    s.setState((st: BState) => ({ ...st, y: st.y + 1 }))
    s.setState((st: BState) => ({ ...st, z: st.z + 1 }))
  }

  const updateBatched = () => {
    const b = batcherRef.current!
    b.batch(() => {
      b.setState((st: BState) => ({ ...st, x: st.x + 1 }))
      b.setState((st: BState) => ({ ...st, y: st.y + 1 }))
      b.setState((st: BState) => ({ ...st, z: st.z + 1 }))
    })
  }

  const barColor = (v: number, max: number) => `${Math.min(100, max > 0 ? (v / max) * 100 : 0)}%`
  const maxVal = Math.max(normalState.x, normalState.y, normalState.z, batchedState.x, batchedState.y, batchedState.z, 1)

  return (
    <div style={{ background:'#0a0f1e',borderRadius:'12px',padding:'1.5rem',border:'1px solid #1e293b' }}>
      <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',padding:'0.25rem 0.65rem',borderRadius:'2rem',marginBottom:'0.75rem' }}>
        <span style={{ color:'#fbbf24',fontSize:'0.7rem',fontWeight:700 }}>createBatcher()</span>
      </div>
      <h3 style={{ color:'#e2e8f0',marginBottom:'0.4rem',fontSize:'1rem',fontWeight:700 }}>⚡ Batched State Updates</h3>
      <p style={{ color:'#64748b',fontSize:'0.78rem',marginBottom:'1rem',lineHeight:1.5 }}>
        3 setState calls → 3 notifications vs 1. Same result, 3× fewer renders.
      </p>
      {!mounted ? <p style={{ color:'#334155',fontSize:'0.8rem' }}>Loading…</p> : (
        <>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',marginBottom:'1rem' }}>
            {/* Normal */}
            <div style={{ background:'rgba(239,68,68,0.06)',borderRadius:'10px',padding:'0.85rem',border:'1px solid rgba(239,68,68,0.2)' }}>
              <div style={{ color:'#ef4444',fontSize:'0.68rem',fontWeight:700,marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.08em' }}>Normal (3 setState)</div>
              {(['x','y','z'] as const).map(k => (
                <div key={k} style={{ display:'flex',gap:'0.4rem',alignItems:'center',marginBottom:'0.25rem' }}>
                  <span style={{ color:'#64748b',fontSize:'0.65rem',fontFamily:'monospace',width:10 }}>{k}</span>
                  <div style={{ flex:1,height:4,background:'#1e293b',borderRadius:'2px',overflow:'hidden' }}>
                    <div style={{ width:barColor(normalState[k],maxVal),height:'100%',background:'#ef4444',transition:'width 0.2s' }} />
                  </div>
                  <span style={{ color:'#e2e8f0',fontSize:'0.65rem',fontFamily:'monospace',width:20,textAlign:'right' }}>{normalState[k]}</span>
                </div>
              ))}
              <div style={{ marginTop:'0.6rem',textAlign:'center' }}>
                <span style={{ color:'#ef4444',fontSize:'1.2rem',fontWeight:900,fontFamily:'monospace' }}>{normalNotifs}</span>
                <div style={{ color:'#475569',fontSize:'0.6rem' }}>notifications</div>
              </div>
              <button type="button" onClick={updateNormal} style={{ width:'100%',marginTop:'0.6rem',padding:'0.4rem',background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:'7px',color:'#ef4444',fontSize:'0.72rem',fontWeight:700,cursor:'pointer' }}>
                3 separate calls
              </button>
            </div>
            {/* Batched */}
            <div style={{ background:'rgba(16,185,129,0.06)',borderRadius:'10px',padding:'0.85rem',border:'1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ color:'#10b981',fontSize:'0.68rem',fontWeight:700,marginBottom:'0.5rem',textTransform:'uppercase',letterSpacing:'0.08em' }}>Batched (1 notify)</div>
              {(['x','y','z'] as const).map(k => (
                <div key={k} style={{ display:'flex',gap:'0.4rem',alignItems:'center',marginBottom:'0.25rem' }}>
                  <span style={{ color:'#64748b',fontSize:'0.65rem',fontFamily:'monospace',width:10 }}>{k}</span>
                  <div style={{ flex:1,height:4,background:'#1e293b',borderRadius:'2px',overflow:'hidden' }}>
                    <div style={{ width:barColor(batchedState[k],maxVal),height:'100%',background:'#10b981',transition:'width 0.2s' }} />
                  </div>
                  <span style={{ color:'#e2e8f0',fontSize:'0.65rem',fontFamily:'monospace',width:20,textAlign:'right' }}>{batchedState[k]}</span>
                </div>
              ))}
              <div style={{ marginTop:'0.6rem',textAlign:'center' }}>
                <span style={{ color:'#10b981',fontSize:'1.2rem',fontWeight:900,fontFamily:'monospace' }}>{batchedNotifs}</span>
                <div style={{ color:'#475569',fontSize:'0.6rem' }}>notifications</div>
              </div>
              <button type="button" onClick={updateBatched} style={{ width:'100%',marginTop:'0.6rem',padding:'0.4rem',background:'linear-gradient(135deg,#065f46,#10b981)',border:'none',borderRadius:'7px',color:'white',fontSize:'0.72rem',fontWeight:700,cursor:'pointer' }}>
                batch(3 calls)
              </button>
            </div>
          </div>
          {(normalNotifs > 0 || batchedNotifs > 0) && (
            <div style={{ background:'rgba(245,158,11,0.08)',borderRadius:'8px',padding:'0.65rem 0.85rem',border:'1px solid rgba(245,158,11,0.2)',fontSize:'0.72rem',color:'#94a3b8' }}>
              Ratio: <strong style={{ color:'#fbbf24' }}>{normalNotifs} vs {batchedNotifs}</strong> notifications for the same state change
              {normalNotifs > 0 && batchedNotifs > 0 && <> — batching saved <strong style={{ color:'#10b981' }}>{Math.round((1 - batchedNotifs/normalNotifs)*100)}% of renders</strong></>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FeaturesPage() {
  const formState = useFormState()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <>
      <style>{`
        html, body { background: #0f172a !important; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
      `}</style>

      <div style={{ background:'#0f172a',minHeight:'100vh',color:'#e2e8f0' }}>
        <div style={{ maxWidth:1200,margin:'0 auto',padding:'2rem' }}>

          {/* Hero */}
          <div style={{
            background:'linear-gradient(135deg,#0f0c29,#1e1b4b,#0f172a)',
            borderRadius:'24px',padding:'3rem',marginBottom:'1.5rem',
            border:'1px solid rgba(139,92,246,0.25)',position:'relative',overflow:'hidden',
          }}>
            <div style={{ position:'absolute',top:0,left:0,right:0,bottom:0,background:'radial-gradient(ellipse at 80% 50%,rgba(139,92,246,0.12) 0%,transparent 60%)',pointerEvents:'none' }} />
            <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',flexWrap:'wrap',gap:'1.5rem',position:'relative' }}>
              <div>
                <div style={{ display:'inline-flex',alignItems:'center',gap:'0.5rem',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.3)',padding:'0.3rem 0.8rem',borderRadius:'2rem',marginBottom:'1rem' }}>
                  <code style={{ color:'#c4b5fd',fontSize:'0.75rem',fontWeight:700 }}>@yedoma-labs/ichchi-state</code>
                </div>
                <h1 style={{ fontSize:'clamp(1.75rem,4vw,3rem)',fontWeight:900,margin:'0 0 0.5rem',background:'linear-gradient(135deg,#e2e8f0,#c4b5fd,#818cf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',lineHeight:1.05 }}>
                  Advanced Features
                </h1>
                <p style={{ color:'#94a3b8',fontSize:'1rem',margin:'0 0 1.5rem',maxWidth:500 }}>
                  Computed values, time-travel debugging, optimistic updates, and cross-tab sync — all powered by ichchi-state.
                </p>
                <div style={{ display:'flex',gap:'0.6rem',flexWrap:'wrap' }}>
                  {['Computed Values','Time-Travel Debug','Optimistic Updates','Cross-Tab Sync','History Branching','subscribeToField','createBatcher','Atomic State'].map(t => (
                    <span key={t} style={{ padding:'0.3rem 0.7rem',background:'rgba(139,92,246,0.1)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:'6px',color:'#c4b5fd',fontSize:'0.72rem',fontWeight:700 }}>{t}</span>
                  ))}
                </div>
              </div>
              <div style={{ fontSize:'5rem',lineHeight:1,animation:'float 4s ease-in-out infinite',flexShrink:0 }}>🚀</div>
            </div>
          </div>

          <div style={{ marginBottom:'1.5rem' }}>
            <Link href="/" style={{ color:'#8b5cf6',textDecoration:'none',fontSize:'0.85rem' }}>← All Demos</Link>
          </div>

          {/* Feature Grid */}
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'1.25rem',marginBottom:'1.5rem' }}>
            <LikeButton />
            <ComputedStats />
          </div>
          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'1.25rem',marginBottom:'1.5rem' }}>
            <TimeTravelDebugger />
            <OptimisticTodoList />
          </div>

          <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(340px,1fr))',gap:'1.25rem',marginBottom:'1.5rem' }}>
            <HistoryBranchingDemo />
            <FieldSubscriptionDemo />
          </div>

          <div style={{ marginBottom:'1.5rem' }}>
            <BatchUpdateDemo />
          </div>

          {/* Cross-Tab Sync banner */}
          <div style={{
            background:'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(6,182,212,0.1))',
            border:'1px solid rgba(16,185,129,0.3)',borderRadius:'14px',padding:'1.5rem',marginBottom:'1.5rem',
          }}>
            <h3 style={{ color:'#34d399',marginBottom:'0.5rem',fontSize:'1rem',fontWeight:700 }}>📡 Cross-Tab Sync Active</h3>
            <p style={{ color:'#64748b',fontSize:'0.85rem',marginBottom:'0.5rem' }}>
              Open this page in multiple tabs and submit the contact form on the home page.
              All tabs sync automatically via localStorage BroadcastChannel events!
            </p>
            {mounted && (
              <p style={{ color:'#a78bfa',fontSize:'0.85rem',fontFamily:'monospace',margin:0 }}>
                Current submission count: <strong style={{ color:'#c4b5fd' }}>{formState.submissionCount}</strong>
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center',padding:'2rem 1rem',borderTop:'1px solid #1e293b',color:'#334155' }}>
            <p style={{ marginBottom:'0.5rem' }}>
              <span style={{ background:'linear-gradient(135deg,#c4b5fd,#818cf8)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',backgroundClip:'text',fontWeight:800,fontSize:'1rem' }}>
                ichchi-state advanced features
              </span>
            </p>
            <p style={{ fontSize:'0.8rem' }}>
              <Link href="/" style={{ color:'#8b5cf6',textDecoration:'none' }}>← Yedoma Labs Demo Hub</Link>
            </p>
          </div>

        </div>
      </div>
    </>
  )
}
