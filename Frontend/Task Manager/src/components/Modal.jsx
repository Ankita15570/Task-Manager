import { LuX } from 'react-icons/lu'

const Modal = ({ children, isOpen, onClose, title}) => {

    if(!isOpen) return null;
    
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button type="button" aria-label="Close modal" className="text-slate-400 hover:text-slate-700" onClick={onClose}>
            <LuX className="text-xl" />
          </button>
        </div>
        <div className="pt-4">{children}</div>
      </div>
    </div>
  )
}

export default Modal
