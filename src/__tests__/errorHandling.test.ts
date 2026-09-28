describe('403 Authorization & Subscription custom events', () => {
  it('dispatches custom event for 403 authorization forbidden', (done) => {
    window.addEventListener(
      'authorization_forbidden',
      (e: Event) => {
        const detail = (e as CustomEvent).detail;
        expect(detail.status).toBe(403);
        done();
      },
      { once: true }
    );

    window.dispatchEvent(
      new CustomEvent('authorization_forbidden', { detail: { status: 403 } })
    );
  });

  it('dispatches custom event for subscription required', (done) => {
    window.addEventListener(
      'subscription_required',
      (e: Event) => {
        const detail = (e as CustomEvent).detail;
        expect(detail.status).toBe(402);
        done();
      },
      { once: true }
    );

    window.dispatchEvent(
      new CustomEvent('subscription_required', { detail: { status: 402 } })
    );
  });
});
