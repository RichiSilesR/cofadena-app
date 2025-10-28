import * as React from 'react';
import { Dialog, DialogOverlay, DialogContent } from '@reach/dialog';
import '@reach/dialog/styles.css';
import '@/styles/modal-overrides.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  return (
    <Dialog isOpen={isOpen} onDismiss={onClose} aria-label="Modal">
      {/* Overlay del modal (oscurece fondo). */}
  <DialogOverlay className="fixed inset-0 bg-black bg-opacity-50 z-40" />

      {/*
        DialogContent no debe imponer un fondo blanco para evitar el rectángulo
        detrás del contenido. Dejamos el fondo transparente y delegamos el
        estilo visual al contenido hijo (la caja oscura en `page.tsx`).
      */}
  <DialogContent className="relative z-60 outline-none p-0 bg-transparent">
        {/* Botón de cierre (visible sobre fondos oscuros). */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3 right-3 text-white bg-transparent hover:opacity-80 z-70"
          style={{ fontSize: 20 }}
        >
          ×
        </button>

        {children}
      </DialogContent>
    </Dialog>
  );
};