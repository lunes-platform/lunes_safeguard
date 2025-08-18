import { AlertCircle } from 'lucide-react';
import { useErrorModalStore } from '../stores/useErrorModalStore';
import { Button } from './ui/button';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalBody, ModalFooter } from './ui/modal';

export function ErrorModal() {
  const { isOpen, title, message, hideErrorModal } = useErrorModalStore();

  if (!isOpen) {
    return null;
  }

  return (
    <Modal open={isOpen} onOpenChange={hideErrorModal}>
      <ModalContent size="md">
        <ModalHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <ModalTitle className="text-xl font-bold text-slate-800">{title}</ModalTitle>
          </div>
        </ModalHeader>
        <ModalBody>
          <p className="text-slate-600">{message}</p>
        </ModalBody>
        <ModalFooter>
          <Button onClick={hideErrorModal} variant="destructive">
            Fechar
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}