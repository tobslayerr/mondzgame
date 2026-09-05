import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

// Icon Sukses (Centang)
const IconCheckCircle = () => (
 <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
);

// Icon Error (Silang)
const IconXCircle = () => (
 <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
 </svg>
);

// Icon Info (Seru)
const IconInformationCircle = () => (
 <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
   <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
 </svg>
);


const InfoModal = ({ isOpen, onClose, title, message, type = 'info' }) => { // type: 'success', 'error', 'info'

  const getIcon = () => {
    switch (type) {
      case 'success': return <IconCheckCircle />;
      case 'error': return <IconXCircle />;
      case 'info':
      default: return <IconInformationCircle />;
    }
  };

  const getTitleColor = () => {
     switch (type) {
      case 'success': return 'text-green-500';
      case 'error': return 'text-gacha-red';
      case 'info':
      default: return 'text-blue-400';
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50 font-sans" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/70" />
        </Transition.Child>

        {/* Konten Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-secondary-dark p-6 text-left align-middle shadow-xl transition-all border border-primary-dark">
                <Dialog.Title
                  as="h3"
                  className={`text-lg font-bold leading-6 ${getTitleColor()} flex items-center gap-2`}
                >
                  {getIcon()}
                  {title || 'Informasi'}
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-text-muted">
                    {message || 'Operasi selesai.'}
                  </p>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-6 flex justify-end">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gacha-red px-4 py-2 text-sm font-medium text-white hover:bg-gacha-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-dark"
                    onClick={onClose}
                  >
                    Tutup
                  </motion.button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default InfoModal;