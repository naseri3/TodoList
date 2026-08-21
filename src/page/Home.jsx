import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import Header from '../components/Header';
import folderIcon from '../assets/icons/folder.png';
import searchIcon from '../assets/icons/search.png';
import menuIcon from '../assets/icons/solar_menu-dots-bold.png';
import checkIcon from '../assets/icons/check.png';
import errorIcon from '../assets/icons/error.png';
import '../styles/Home.css';

const STORAGE_KEY = 'todoListFolders';
const GUEST_FOLDER_LIMIT = 3;
const FOLDER_COLORS = [
   '#b7b7b7',
   '#ffbfc1',
   '#ffdec5',
   '#b9dd99',
   '#96d5dc',
   '#ccb0ef',
   '#e6b2dc',
];

const getSavedFolders = () => {
   try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
   } catch {
      return [];
   }
};

const Home = ({ user }) => {
   const navigate = useNavigate();
   const [folders, setFolders] = useState(getSavedFolders);
   const [search, setSearch] = useState('');
   const [openMenuId, setOpenMenuId] = useState(null);
   const [modal, setModal] = useState(null);
   const [folderName, setFolderName] = useState('');
   const [folderColor, setFolderColor] = useState(FOLDER_COLORS[0]);
   const menuAreaRef = useRef(null);

   useEffect(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(folders));
   }, [folders]);

   useEffect(() => {
      const closeMenu = (event) => {
         if (!menuAreaRef.current?.contains(event.target)) setOpenMenuId(null);
      };

      document.addEventListener('mousedown', closeMenu);
      return () => document.removeEventListener('mousedown', closeMenu);
   }, []);

   const filteredFolders = useMemo(() => {
      const keyword = search.trim().toLowerCase();
      return folders.filter((folder) =>
         folder.name.toLowerCase().includes(keyword)
      );
   }, [folders, search]);

   const openCreateModal = () => {
      if (!user && folders.length >= GUEST_FOLDER_LIMIT) {
         setOpenMenuId(null);
         setModal({ type: 'limit' });
         return;
      }

      setFolderName('');
      setFolderColor(FOLDER_COLORS[0]);
      setOpenMenuId(null);
      setModal({ type: 'create' });
   };

   const openEditModal = (folder) => {
      setFolderName(folder.name);
      setFolderColor(folder.color);
      setOpenMenuId(null);
      setModal({ type: 'edit', folderId: folder.id });
   };

   const saveFolder = (event) => {
      event.preventDefault();
      const name = folderName.trim();
      if (!name) return;

      if (modal.type === 'create' && !user && folders.length >= GUEST_FOLDER_LIMIT) {
         setModal({ type: 'limit' });
         return;
      }

      if (modal.type === 'edit') {
         setFolders((current) =>
            current.map((folder) =>
               folder.id === modal.folderId
                  ? { ...folder, name, color: folderColor }
                  : folder
            )
         );
      } else {
         const today = new Date();
         setFolders((current) => [
            ...current,
            {
               id: crypto.randomUUID(),
               name,
               color: folderColor,
               total: 0,
               completed: 0,
               updatedAt: `${today.getFullYear()}.${String(
                  today.getMonth() + 1
               ).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`,
            },
         ]);
      }

      setModal(null);
   };

   const deleteFolder = (folder) => {
      setOpenMenuId(null);
      setModal({ type: 'delete', folderId: folder.id });
   };

   const confirmDeleteFolder = () => {
      setFolders((current) =>
         current.filter((item) => item.id !== modal.folderId)
      );
      setModal(null);
   };

   return (
      <div className="home-page">
         <Header user={user} />

         <main className="home-content">
            <label className="list-search">
               <img src={searchIcon} alt="" />
               <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="리스트 검색"
                  aria-label="리스트 검색"
               />
            </label>

            {filteredFolders.length > 0 ? (
               <section className="folder-list" aria-label="리스트 목록">
                  {filteredFolders.map((folder) => (
                     <article
                        className="folder-card"
                        key={folder.id}
                        style={{ '--folder-color': folder.color }}
                        onClick={() => navigate(`/folder/${folder.id}`)}
                        tabIndex="0"
                        onKeyDown={(event) => {
                           if (event.key === 'Enter')
                              navigate(`/folder/${folder.id}`);
                        }}
                     >
                        <div className="folder-card-info">
                           <h2>{folder.name}</h2>
                           <p>
                              전체 {folder.total} · 완료 {folder.completed}
                           </p>
                           <p>{folder.updatedAt} 수정</p>
                        </div>

                        <div
                           className="folder-menu-area"
                           ref={openMenuId === folder.id ? menuAreaRef : null}
                           onClick={(event) => event.stopPropagation()}
                        >
                           <button
                              type="button"
                              className="folder-menu-button"
                              onClick={() =>
                                 setOpenMenuId((id) =>
                                    id === folder.id ? null : folder.id
                                 )
                              }
                              aria-label={`${folder.name} 메뉴`}
                              aria-expanded={openMenuId === folder.id}
                           >
                              <img src={menuIcon} alt="" />
                           </button>

                           {openMenuId === folder.id && (
                              <div className="folder-menu">
                                 <button
                                    type="button"
                                    onClick={() => openEditModal(folder)}
                                 >
                                    수정
                                 </button>
                                 <button
                                    type="button"
                                    className="delete"
                                    onClick={() => deleteFolder(folder)}
                                 >
                                    삭제
                                 </button>
                              </div>
                           )}
                        </div>
                     </article>
                  ))}
               </section>
            ) : folders.length === 0 ? (
               <section className="empty-list">
                  <img src={folderIcon} alt="" />
                  <h1>아직 생성된 리스트가 없습니다.</h1>
                  <p>
                     새 리스트를 만들어
                     <br />할 일을 관리해보세요!
                  </p>
                  <button type="button" onClick={openCreateModal}>
                     ＋ 새 리스트 만들기
                  </button>
               </section>
            ) : (
               <p className="no-search-result">검색 결과가 없습니다.</p>
            )}

            {folders.length > 0 && (
               <button
                  type="button"
                  className="create-list-button"
                  onClick={openCreateModal}
               >
                  ＋ 새 리스트 만들기
               </button>
            )}
         </main>

         {modal?.type === 'delete' && (
            <div
               className="warning-modal-backdrop"
               role="presentation"
               onMouseDown={() => setModal(null)}
            >
               <div
                  className="warning-modal"
                  role="alertdialog"
                  aria-modal="true"
                  onMouseDown={(event) => event.stopPropagation()}
               >
                  <img src={errorIcon} alt="오류" className="error-icon" />
                  <p>
                     이 리스트를 삭제하면
                     <br />
                     포함된 모든 할 일도 함께 삭제됩니다.
                     <br />
                     <strong>삭제한 데이터는 복구할 수 없습니다.</strong>
                  </p>
                  <div className="warning-modal-actions">
                     <button type="button" onClick={() => setModal(null)}>
                        취소
                     </button>
                     <button type="button" onClick={confirmDeleteFolder}>
                        삭제
                     </button>
                  </div>
               </div>
            </div>
         )}

         {modal?.type === 'limit' && (
            <div
               className="warning-modal-backdrop"
               role="presentation"
               onMouseDown={() => setModal(null)}
            >
               <div
                  className="warning-modal"
                  role="alertdialog"
                  aria-modal="true"
                  aria-labelledby="folder-limit-title"
                  onMouseDown={(event) => event.stopPropagation()}
               >
                  <img src={errorIcon} alt="" className="error-icon" />
                  <p>
                     <strong id="folder-limit-title">추가 폴더를 생성할 수 없습니다.</strong>
                     <br />
                     비로그인 사용자는 폴더를 최대 {GUEST_FOLDER_LIMIT}개까지 생성할 수 있습니다.
                  </p>
                  <div className="warning-modal-actions limit-modal-actions">
                     <button type="button" onClick={() => setModal(null)} autoFocus>
                        확인
                     </button>
                  </div>
               </div>
            </div>
         )}

         {modal && modal.type !== 'delete' && modal.type !== 'limit' && (
            <div
               className="folder-modal-backdrop"
               role="presentation"
               onMouseDown={() => setModal(null)}
            >
               <form
                  className="folder-modal"
                  onSubmit={saveFolder}
                  onMouseDown={(event) => event.stopPropagation()}
               >
                  <div className="folder-modal-heading">
                     <h2>리스트 설정</h2>
                     <button
                        type="button"
                        onClick={() => setModal(null)}
                        aria-label="닫기"
                     >
                        ×
                     </button>
                  </div>

                  <label htmlFor="folder-name">리스트명</label>
                  <input
                     id="folder-name"
                     value={folderName}
                     onChange={(event) => setFolderName(event.target.value)}
                     placeholder="폴더 이름"
                     maxLength={30}
                     autoFocus
                  />

                  <fieldset>
                     <legend>폴더 컬러 선택</legend>
                     <div className="color-options">
                        {FOLDER_COLORS.map((color) => (
                           <button
                              type="button"
                              key={color}
                              className={
                                 folderColor === color ? 'selected' : ''
                              }
                              style={{ backgroundColor: color }}
                              onClick={() => setFolderColor(color)}
                              aria-label={`${color} 색상 선택`}
                              aria-pressed={folderColor === color}
                           >
                              {folderColor === color && (
                                 <img src={checkIcon} alt="" />
                              )}
                           </button>
                        ))}
                     </div>
                  </fieldset>

                  {modal.type === 'edit' && (
                     <button
                        type="button"
                        className="modal-delete-button"
                        onClick={() => {
                           const folder = folders.find(
                              (item) => item.id === modal.folderId
                           );
                           if (folder) deleteFolder(folder);
                        }}
                     >
                        리스트 삭제
                     </button>
                  )}

                  <div className="folder-modal-actions">
                     <button type="button" onClick={() => setModal(null)}>
                        취소
                     </button>
                     <button type="submit" disabled={!folderName.trim()}>
                        {modal.type === 'edit' ? '변경 완료' : '폴더 추가'}
                     </button>
                  </div>
               </form>
            </div>
         )}
      </div>
   );
};

export default Home;
