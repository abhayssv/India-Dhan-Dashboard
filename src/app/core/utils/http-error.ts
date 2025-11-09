export function getHttpErrorMessage(err: any): string {
    // Angular HttpErrorResponse shape: err.error can be string | object
    const e = err?.error;
  
    if (typeof e === 'string' && e.trim()) return e;
  
    if (e && typeof e === 'object') {
      // common keys from many backends
      const msg = e.message || e.error || e.detail || e.msg || e.reason;
      if (typeof msg === 'string' && msg.trim()) return msg;
      try {
        return JSON.stringify(e);
      } catch {}
    }
  
    if (err?.message) return err.message;
  
    return 'Something went wrong';
}

export function prettifyError(msg: string): string {
    if (/duplicate key value violates unique constraint/i.test(msg) && /permissions_key/i.test(msg)) {
      return 'Permission key already exists.';
    }
    if (/duplicate key/i.test(msg)) return 'Duplicate key.';
    return msg;
}
  

  