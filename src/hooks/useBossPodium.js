// ===== LIBRARIES ===== //
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";

// ===== HOOKS ===== //
import useBossBattle from "./useBossBattle";

// ===== SERVICES ===== //
import { fetchEventBossById } from "@/services/eventBossService";

// ===== UTILITIES ===== //
import { SOCKET_EVENTS } from "@/utils/socketConstants";
import { getUserInfo } from "@/utils/userUtils";

const useBossPodium = (eventBossId, joinCode) => {
  const { socket } = useBossBattle();
};

export default useBossPodium;
