/**
 * Phase 11: Menu Button
 * Hamburger menu button for mobile
 */

import React from 'react';
import { Menu } from 'lucide-react';
import { useUIStore } from '@/lib/stores/ui.store';

export const MenuButton: React.FC = () => {
  const { toggleMobileDrawer } = useUIStore();

  return (
    <button
      onClick={toggleMobileDrawer}
      className="
        md:hidden p-2 hover:bg-white/10 rounded-lg
        transition-colors
      "
      aria-label="Open menu"
    >
      <Menu className="w-6 h-6 text-gray-300" />
    </button>
  );
};
