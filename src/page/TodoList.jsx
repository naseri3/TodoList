import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import Header from '../components/Header';
import folderIcon from '../assets/icons/folder.png';
import searchIcon from '../assets/icons/search.png';
import errorIcon from '../assets/icons/error.png';
import pencilIcon from '../assets/icons/proicons_pencil.png';
import '../styles/TodoList.css';

const STORAGE_KEY = 'todoListFolders';
const IMPORTANCE = ['높음', '중간', '낮음'];
const EMPTY_TASKS = [];
const GUEST_TASK_LIMIT = 3;

const readFolders = () => {
   try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
   } catch {
      return [];
   }
};

function TodoList({ user }) {
   const { folderId } = useParams();
   const navigate = useNavigate();
   const [folders, setFolders] = useState(readFolders);
   const [search, setSearch] = useState('');
   const [filter, setFilter] = useState('all');
   const [modal, setModal] = useState(null);
   const [title, setTitle] = useState('');
   const [importance, setImportance] = useState('중간');
   const [isEditingListTitle, setIsEditingListTitle] = useState(false);
   const [listTitle, setListTitle] = useState('');
   const folder = folders.find((item) => item.id === folderId);
   const tasks = folder?.todos ?? EMPTY_TASKS;

   useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
   }, [folders]);

   const updateTasks = (updater) => {
      setFolders((current) => current.map((item) => {
         if (item.id !== folderId) return item;
         const todos = updater(item.todos || []);
         const now = new Date();
         return {
            ...item,
            todos,
            total: todos.length,
            completed: todos.filter((task) => task.completed).length,
            updatedAt: `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`,
         };
      }));
   };

   const visibleTasks = useMemo(() => {
      const keyword = search.trim().toLowerCase();
      return tasks.filter((task) => {
         const stateMatches = filter === 'all' || (filter === 'done' ? task.completed : !task.completed);
         return stateMatches && task.title.toLowerCase().includes(keyword);
      });
   }, [tasks, search, filter]);

   const openTaskModal = (task) => {
      if (!task && !user && tasks.length >= GUEST_TASK_LIMIT) {
         setModal({ type: 'limit' });
         return;
      }

      setTitle(task?.title || '');
      setImportance(task?.importance || '중간');
      setModal(task ? { type: 'edit', taskId: task.id } : { type: 'create' });
   };

   const saveTask = (event) => {
      event.preventDefault();
      const nextTitle = title.trim();
      if (!nextTitle) return;
      if (modal.type === 'create' && !user && tasks.length >= GUEST_TASK_LIMIT) {
         setModal({ type: 'limit' });
         return;
      }
      updateTasks((current) => modal.type === 'edit'
         ? current.map((task) => task.id === modal.taskId ? { ...task, title: nextTitle, importance } : task)
         : [...current, { id: crypto.randomUUID(), title: nextTitle, importance, completed: false }]
      );
      setModal(null);
   };

   const startEditingListTitle = () => {
      setListTitle(folder.name);
      setIsEditingListTitle(true);
   };

   const saveListTitle = () => {
      const nextTitle = listTitle.trim();

      if (nextTitle) {
         setFolders((current) => current.map((item) => (
            item.id === folderId ? { ...item, name: nextTitle } : item
         )));
      }

      setIsEditingListTitle(false);
   };

   if (!folder) {
      return <div className="todo-page"><Header user={user} /><div className="missing-folder"><p>존재하지 않는 리스트입니다.</p><button type="button" onClick={() => navigate('/home')}>홈으로</button></div></div>;
   }

   const completed = tasks.filter((task) => task.completed).length;

   return (
      <div className="todo-page">
         <Header user={user} />
         <main className="todo-content">
            <div className="todo-title-row">
               <button type="button" onClick={() => navigate('/home')} aria-label="홈으로">‹</button>
               {isEditingListTitle ? (
                  <input
                     className="todo-title-input"
                     type="text"
                     value={listTitle}
                     onChange={(event) => setListTitle(event.target.value)}
                     onBlur={saveListTitle}
                     onKeyDown={(event) => {
                        if (event.key === 'Enter') saveListTitle();
                        if (event.key === 'Escape') setIsEditingListTitle(false);
                     }}
                     aria-label="리스트 제목"
                     maxLength={50}
                     autoFocus
                  />
               ) : (
                  <h1>{folder.name}</h1>
               )}
               <button type="button" onClick={startEditingListTitle} aria-label="리스트 제목 수정">
                  <img src={pencilIcon} alt="" aria-hidden="true" />
               </button>
            </div>

            <div className="todo-stats">
               <span>전체 <strong>{tasks.length}</strong></span>
               <span>진행 <strong>{tasks.length - completed}</strong></span>
               <span>완료 <strong>{completed}</strong></span>
            </div>

            <label className="todo-search">
               <img src={searchIcon} alt="" />
               <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="할 일 검색" aria-label="할 일 검색" />
            </label>

            <div className="todo-filters">
               {[['all', '전체'], ['doing', '진행중'], ['done', '완료']].map(([value, label]) => (
                  <button type="button" key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>
               ))}
            </div>

            {visibleTasks.length ? (
               <section className="tasks-list">
                  {visibleTasks.map((task) => (
                     <article className="task-item" key={task.id}>
                        <label>
                           <input type="checkbox" checked={task.completed} onChange={() => updateTasks((current) => current.map((item) => item.id === task.id ? { ...item, completed: !item.completed } : item))} />
                           <span className={task.completed ? 'completed' : ''}>{task.title}</span>
                        </label>
                        <span className={`importance importance-${task.importance}`}>{task.importance}</span>
                        <div>
                           <button type="button" onClick={() => openTaskModal(task)}>수정</button>
                           <button type="button" onClick={() => setModal({ type: 'delete', taskId: task.id })}>삭제</button>
                        </div>
                     </article>
                  ))}
               </section>
            ) : tasks.length === 0 ? (
               <section className="todo-empty">
                  <img src={folderIcon} alt="" />
                  <h2>등록된 할일이 없습니다.</h2>
                  <p>새 할 일을 추가해주세요.</p>
                  <button type="button" onClick={() => openTaskModal()}>＋ 할 일 추가</button>
               </section>
            ) : <p className="todo-no-result">조건에 맞는 할 일이 없습니다.</p>}

            {tasks.length > 0 && <button type="button" className="add-task-button" onClick={() => openTaskModal()}>＋ 할 일 추가</button>}
         </main>

         {modal?.type === 'delete' && (
            <div className="warning-modal-backdrop" onMouseDown={() => setModal(null)}>
               <div className="warning-modal" role="alertdialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
                  <img src={errorIcon} alt="오류" className="error-icon" />
                  <p>이 할 일을 삭제할까요?<br /><strong>삭제한 데이터는 복구할 수 없습니다.</strong></p>
                  <div className="warning-modal-actions">
                     <button type="button" onClick={() => setModal(null)}>취소</button>
                     <button type="button" onClick={() => { updateTasks((current) => current.filter((task) => task.id !== modal.taskId)); setModal(null); }}>삭제</button>
                  </div>
               </div>
            </div>
         )}

         {modal?.type === 'limit' && (
            <div className="warning-modal-backdrop" onMouseDown={() => setModal(null)}>
               <div
                  className="warning-modal"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="task-limit-title"
                  onMouseDown={(event) => event.stopPropagation()}
               >
                  <img src={errorIcon} alt="" className="error-icon" />
                  <p>
                     <strong id="task-limit-title">추가 리스트를 생성할 수 없습니다.</strong>
                     <br />
                     비로그인 사용자는 할 일을 최대 {GUEST_TASK_LIMIT}개까지 생성할 수 있습니다.
                  </p>
                  <div className="warning-modal-actions limit-modal-actions">
                     <button type="button" onClick={() => setModal(null)} autoFocus>확인</button>
                  </div>
               </div>
            </div>
         )}

         {modal && modal.type !== 'delete' && modal.type !== 'limit' && (
            <div className="task-modal-backdrop" onMouseDown={() => setModal(null)}>
               <form className="task-modal" onSubmit={saveTask} onMouseDown={(event) => event.stopPropagation()}>
                  <div className="task-modal-heading"><h2>할일 설정</h2><button type="button" onClick={() => setModal(null)} aria-label="닫기">×</button></div>
                  <label htmlFor="task-title">할 일 입력</label>
                  <input id="task-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="할 일 입력" autoFocus maxLength={50} />
                  <label className="importance-select">중요도<select value={importance} onChange={(event) => setImportance(event.target.value)}>{IMPORTANCE.map((item) => <option key={item}>{item}</option>)}</select></label>
                  {modal.type === 'edit' && <button type="button" className="task-modal-delete" onClick={() => setModal({ type: 'delete', taskId: modal.taskId })}>할 일 삭제</button>}
                  <div className="task-modal-actions"><button type="button" onClick={() => setModal(null)}>취소</button><button type="submit" disabled={!title.trim()}>{modal.type === 'edit' ? '변경 완료' : '할일 추가'}</button></div>
               </form>
            </div>
         )}
      </div>
   );
}

export default TodoList;
