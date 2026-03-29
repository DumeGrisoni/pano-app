import React, { Suspense } from 'react';
import { EnvVarWarning } from '../env-var-warning';
import { AuthButton } from '../auth-button';
import { hasEnvVars } from '@/lib/utils';

const Connect = () => {
  return (
    <div>
      {' '}
      {!hasEnvVars ? (
        <EnvVarWarning />
      ) : (
        <Suspense>
          <AuthButton />
        </Suspense>
      )}
    </div>
  );
};

export default Connect;
