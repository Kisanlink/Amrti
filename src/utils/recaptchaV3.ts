// reCAPTCHA v3 utility for login forms
// This is separate from Firebase reCAPTCHA v2 which is required for phone auth

export const RECAPTCHA_V3_SITE_KEY = '6LdLhPkrAAAAAA_VZjoNOa9RHa-QLNXPhIqO5R7z';

// Check if reCAPTCHA v3 is loaded
export const isRecaptchaV3Loaded = (): boolean => {
  return typeof window !== 'undefined' && 
         typeof (window as any).grecaptcha !== 'undefined' &&
         typeof (window as any).grecaptcha.execute === 'function';
};

// Wait for reCAPTCHA v3 to be ready
export const waitForRecaptchaV3 = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (isRecaptchaV3Loaded()) {
      resolve();
      return;
    }

    let attempts = 0;
    const maxAttempts = 50; // 5 seconds with 100ms intervals

    const checkRecaptcha = () => {
      attempts++;
      if (isRecaptchaV3Loaded()) {
        resolve();
      } else if (attempts >= maxAttempts) {
        reject(new Error('reCAPTCHA v3 failed to load within 5 seconds'));
      } else {
        setTimeout(checkRecaptcha, 100);
      }
    };

    checkRecaptcha();
  });
};

// Execute reCAPTCHA v3 and get token
export const executeRecaptchaV3 = async (action: string = 'login'): Promise<string> => {
  try {
    await waitForRecaptchaV3();
    
    return new Promise((resolve, reject) => {
      (window as any).grecaptcha.ready(() => {
        (window as any).grecaptcha.execute(RECAPTCHA_V3_SITE_KEY, { action })
          .then((token: string) => {
            console.log('reCAPTCHA v3 token generated for action:', action);
            resolve(token);
          })
          .catch((error: any) => {
            console.error('reCAPTCHA v3 execution failed:', error);
            reject(new Error('Failed to generate reCAPTCHA v3 token'));
          });
      });
    });
  } catch (error) {
    console.error('reCAPTCHA v3 not available:', error);
    throw new Error('reCAPTCHA v3 is not available. Please refresh the page.');
  }
};

// Verify reCAPTCHA v3 token with backend
export const verifyRecaptchaV3Token = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch('http://localhost:8082/api/v1/auth/verify-recaptcha', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recaptcha_token: token,
        action: 'login'
      })
    });

    if (!response.ok) {
      console.error('reCAPTCHA v3 verification failed:', response.status);
      return false;
    }

    const result = await response.json();
    return result.success === true;
  } catch (error) {
    console.error('Error verifying reCAPTCHA v3 token:', error);
    return false;
  }
};

// Combined function to execute and verify reCAPTCHA v3
export const executeAndVerifyRecaptchaV3 = async (action: string = 'login'): Promise<boolean> => {
  try {
    const token = await executeRecaptchaV3(action);
    const isValid = await verifyRecaptchaV3Token(token);
    
    if (!isValid) {
      console.warn('reCAPTCHA v3 verification failed');
      return false;
    }
    
    console.log('reCAPTCHA v3 verification successful');
    return true;
  } catch (error) {
    console.error('reCAPTCHA v3 process failed:', error);
    return false;
  }
};




