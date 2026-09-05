import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion } from 'framer-motion';

// Icon Warning (Opsional, tapi bagus)
const IconExclamationTriangle = () => (
 <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
 </svg>
);


const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
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
                  className="text-lg font-bold leading-6 text-gacha-red flex items-center gap-2"
                >
                  <IconExclamationTriangle />
                  {title || 'Konfirmasi Tindakan'}
                </Dialog.Title>
                <div className="mt-4">
                  <p className="text-sm text-text-muted">
                    {message || 'Apakah Anda yakin ingin melanjutkan tindakan ini?'}
                  </p>
                </div>

                {/* Tombol Aksi */}
                <div className="mt-6 flex justify-end gap-3">
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gray-600 px-4 py-2 text-sm font-medium text-text-light hover:bg-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-dark"
                    onClick={onClose}
                  >
                    Batal
                  </motion.button>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex justify-center rounded-md border border-transparent bg-gacha-red px-4 py-2 text-sm font-medium text-white hover:bg-gacha-red-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-secondary-dark"
                    onClick={() => {
                      onConfirm(); // Jalankan aksi konfirmasi
                      onClose(); // Tutup modal setelah konfirmasi
                    }}
                  >
                    Ya, Lanjutkan
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

export default ConfirmationModal;