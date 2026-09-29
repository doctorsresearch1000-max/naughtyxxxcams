"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { AddToCollectionModal } from "@/components/collections/AddToCollectionModal";
import { usePlaylists } from "@/hooks/useUserLibrary";
import type { SavedModelRef } from "@/lib/user/userLibrary";

type SaveToCollectionContextValue = {
  openSaveModal: (ref: SavedModelRef, onSaved?: () => void) => void;
  openCreateCollectionModal: () => void;
};

const SaveToCollectionContext =
  createContext<SaveToCollectionContextValue | null>(null);

export function SaveToCollectionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const playlists = usePlaylists();
  const [open, setOpen] = useState(false);
  const [createOnly, setCreateOnly] = useState(false);
  const [modelRef, setModelRef] = useState<SavedModelRef | null>(null);
  const [onSaved, setOnSaved] = useState<(() => void) | undefined>();

  const close = useCallback(() => {
    setOpen(false);
    setModelRef(null);
    setOnSaved(undefined);
    setCreateOnly(false);
  }, []);

  const openSaveModal = useCallback(
    (ref: SavedModelRef, done?: () => void) => {
      setModelRef(ref);
      setOnSaved(() => done);
      setCreateOnly(false);
      setOpen(true);
    },
    [],
  );

  const openCreateCollectionModal = useCallback(() => {
    setModelRef(null);
    setOnSaved(undefined);
    setCreateOnly(true);
    setOpen(true);
  }, []);

  const value = useMemo(
    () => ({ openSaveModal, openCreateCollectionModal }),
    [openSaveModal, openCreateCollectionModal],
  );

  return (
    <SaveToCollectionContext.Provider value={value}>
      {children}
      <AddToCollectionModal
        open={open}
        modelRef={modelRef}
        playlists={playlists}
        onClose={close}
        onSaved={onSaved}
        createOnly={createOnly}
      />
    </SaveToCollectionContext.Provider>
  );
}

export function useSaveToCollection(): SaveToCollectionContextValue {
  const ctx = useContext(SaveToCollectionContext);
  if (!ctx) {
    throw new Error(
      "useSaveToCollection must be used within SaveToCollectionProvider",
    );
  }
  return ctx;
}
