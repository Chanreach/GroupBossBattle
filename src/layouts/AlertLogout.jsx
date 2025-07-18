// ===== LIBRARIES ===== //
import { LogOut, AlertTriangle } from "lucide-react";

// ===== COMPONENTS ===== //
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

/**
 * AlertLogout component - Confirmation dialog for user logout
 * @param {boolean} open - Controls whether the dialog is open
 * @param {function} onOpenChange - Called when dialog open state changes
 * @param {function} onConfirm - Called when user confirms logout
 * @param {function} onCancel - Called when user cancels logout (optional)
 */
const AlertLogout = ({ open, onOpenChange, onConfirm, onCancel }) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-lg">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirm Logout
          </AlertDialogTitle>
          <AlertDialogDescription className="text-base">
            Are you sure you want to log out of your account? You'll need to sign in again to access your profile and game data.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex gap-2 sm:gap-3">
          <AlertDialogCancel 
            onClick={handleCancel}
            className="flex-1 sm:flex-none"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            className="flex-1 sm:flex-none bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default AlertLogout;
