'use client';
import * as React from 'react';
import SCADADiagram from './SCADADiagram';
import { useAuth } from '../../../context/auth-context';

export default function ProduccionPage() {
  const { user } = useAuth();
  return (
    <div className="flex flex-col gap-2 h-full min-h-screen bg-gray-50 overflow-x-hidden pt-2">
      <SCADADiagram user={user?.name || ''} role={user?.role || ''} />
    </div>
  );
}
