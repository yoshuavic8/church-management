 npm run build

> church-management@0.1.0 build
> next build

Attention: Next.js now collects completely anonymous telemetry regarding usage.
This information is used to shape Next.js' roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://nextjs.org/telemetry

  ▲ Next.js 14.2.33
  - Environments: .env.local, .env.production

   Creating an optimized production build ...
 ⚠ Compiled with warnings

./app/test-force-camera/page.tsx
Attempted import error: '../components/NoHTTPSQRScanner' does not contain a default export (imported as 'NoHTTPSQRScanner').

Import trace for requested module:
./app/test-force-camera/page.tsx

 ⚠ Compiled with warnings

./app/test-force-camera/page.tsx
Attempted import error: '../components/NoHTTPSQRScanner' does not contain a default export (imported as 'NoHTTPSQRScanner').

Import trace for requested module:
./app/test-force-camera/page.tsx

 ✓ Compiled successfully
   Skipping validation of types
   Skipping linting
 ✓ Collecting page data    
   Generating static pages (0/52)  [=   ]Error generating password list: B [Error]: Dynamic server usage: Route /api/admin/password-list couldn't be rendered statically because it used `request.headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
    at V (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21778)
    at Object.get (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:29465)
    at /www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/admin/administrators/[id]/reset-password/route.js:1:1815
    at s (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/admin/administrators/[id]/reset-password/route.js:1:1898)
    at u (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/admin/password-list/route.js:1:540)
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/server/lib/trace/tracer.js:140:36
    at NoopContextManager.with (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
    at ContextAPI.with (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
    at NoopTracer.startActiveSpan (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093) {
  description: "Route /api/admin/password-list couldn't be rendered statically because it used `request.headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
  digest: 'DYNAMIC_SERVER_USAGE'
}
   Generating static pages (5/52)  [==  ]Error verifying passwords: B [Error]: Dynamic server usage: Route /api/admin/verify-passwords couldn't be rendered statically because it used `request.headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
    at V (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21778)
    at Object.get (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:29465)
    at /www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/admin/administrators/[id]/reset-password/route.js:1:1815
    at s (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/admin/administrators/[id]/reset-password/route.js:1:1898)
    at u (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/admin/verify-passwords/route.js:1:539)
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/server/lib/trace/tracer.js:140:36
    at NoopContextManager.with (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
    at ContextAPI.with (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
    at NoopTracer.startActiveSpan (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093) {
  description: "Route /api/admin/verify-passwords couldn't be rendered statically because it used `request.headers`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
  digest: 'DYNAMIC_SERVER_USAGE'
}
Files API error: B [Error]: Dynamic server usage: Route /api/files couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error
    at V (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:21778)
    at Object.get (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:29465)
    at u (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/app/api/files/route.js:1:546)
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-route.runtime.prod.js:6:38417
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/server/lib/trace/tracer.js:140:36
    at NoopContextManager.with (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:7062)
    at ContextAPI.with (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:518)
    at NoopTracer.startActiveSpan (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18093)
    at ProxyTracer.startActiveSpan (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/@opentelemetry/api/index.js:1:18854)
    at /www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/server/lib/trace/tracer.js:122:103 {
  description: "Route /api/files couldn't be rendered statically because it used `request.url`. See more info here: https://nextjs.org/docs/messages/dynamic-server-error",
  digest: 'DYNAMIC_SERVER_USAGE'
}
   Generating static pages (11/52)  [  ==]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/_not-found". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (12/52)  [   =]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/admin-management". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (12/52)  [    ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/articles/add". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (14/52)  [   =]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/articles". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (15/52)  [  ==]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/file-management". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (16/52)  [ ===]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/files". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (17/52)  [====]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/password-management". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (19/52)  [==  ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/scanner". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/auth/admin/login". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (21/52)  [    ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/auth/login". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/auth/logout". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (23/52)  [=   ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/auth/member/login". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (24/52)  [==  ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/auth/register". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (25/52)  [=== ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/classes/add". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/classes". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (27/52)  [  ==]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/districts/add". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (28/52)  [   =]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/districts". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/news". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (30/52)  [    ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/qr-checkin". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (32/52)  [  ==]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/test-api". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (33/52)  [ ===]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/test-force-camera". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
Error: Unsupported Server Component type: {...}
    at e (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:137969)
    at ek (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:138019)
    at Array.toJSON (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135629)
    at stringify (<anonymous>)
    at eP (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142093)
    at eE (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142572)
    at AsyncLocalStorage.run (node:async_hooks:338:14)
    at Timeout._onTimeout (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150373)
    at listOnTimeout (node:internal/timers:569:17)
    at process.processTimers (node:internal/timers:512:7) {
  digest: '2267891369'
}
Error: Unsupported Server Component type: {...}
    at e (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:137969)
    at ek (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:138019)
    at Array.toJSON (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135629)
    at stringify (<anonymous>)
    at eP (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142093)
    at eE (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142572)
    at Timeout._onTimeout (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135349)
    at listOnTimeout (node:internal/timers:569:17)
    at process.processTimers (node:internal/timers:512:7) {
  digest: '1625911302'
}
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/test-scanner". Read more: https://nextjs.org/docs/messages/prerender-error

Error: Unsupported Server Component type: {...}
    at e (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:137969)
    at ek (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:138019)
    at Array.toJSON (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:135629)
    at stringify (<anonymous>)
    at eP (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142093)
    at eE (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:142572)
    at AsyncLocalStorage.run (node:async_hooks:338:14)
    at Timeout._onTimeout (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:150373)
    at listOnTimeout (node:internal/timers:569:17)
    at process.processTimers (node:internal/timers:512:7)
   Generating static pages (35/52)  [=== ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/projects/add". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/admin/projects". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (37/52)  [==  ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/attendance". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (38/52)  [=   ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/cell-groups/create". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (40/52)  [    ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/cell-groups". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (41/52)  [=   ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/attendance". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/cell-group". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (43/52)  [==  ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/classes". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/profile/change-password". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (45/52)  [ ===]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/profile/edit". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (46/52)  [  ==]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/profile". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (47/52)  [   =]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/dashboard". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (48/52)  [    ]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/member/projects". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (49/52)  [   =]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/members". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (50/52)  [  ==]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/ministries/create". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
   Generating static pages (51/52)  [ ===]ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547) {
  digest: '521261033'
}

Error occurred prerendering page "/ministries". Read more: https://nextjs.org/docs/messages/prerender-error

ReferenceError: navigator is not defined
    at n (/www/wwwroot/gbihal1.server.my/churchManagement/.next/server/chunks/2351.js:1:2128)
    at nj (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:46252)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:47572)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61547)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
    at nB (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:67539)
    at nD (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:66681)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64854)
    at nM (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:61157)
    at nN (/www/wwwroot/gbihal1.server.my/churchManagement/node_modules/next/dist/compiled/next-server/app-page.runtime.prod.js:12:64547)
 ✓ Generating static pages (52/52)

> Export encountered errors on following paths:
	/_not-found/page: /_not-found
	/admin/admin-management/page: /admin/admin-management
	/admin/articles/add/page: /admin/articles/add
	/admin/articles/page: /admin/articles
	/admin/file-management/page: /admin/file-management
	/admin/files/page: /admin/files
	/admin/page: /admin
	/admin/password-management/page: /admin/password-management
	/admin/projects/add/page: /admin/projects/add
	/admin/projects/page: /admin/projects
	/admin/scanner/page: /admin/scanner
	/attendance/page: /attendance
	/auth/admin/login/page: /auth/admin/login
	/auth/login/page: /auth/login
	/auth/logout/page: /auth/logout
	/auth/member/login/page: /auth/member/login
	/auth/register/page: /auth/register
	/cell-groups/create/page: /cell-groups/create
	/cell-groups/page: /cell-groups
	/classes/add/page: /classes/add
	/classes/page: /classes
	/dashboard/page: /dashboard
	/districts/add/page: /districts/add
	/districts/page: /districts
	/member/attendance/page: /member/attendance
	/member/cell-group/page: /member/cell-group
	/member/classes/page: /member/classes
	/member/dashboard/page: /member/dashboard
	/member/news/page: /member/news
	/member/profile/change-password/page: /member/profile/change-password
	/member/profile/edit/page: /member/profile/edit
	/member/profile/page: /member/profile
	/member/projects/page: /member/projects
	/member/qr-checkin/page: /member/qr-checkin
	/members/page: /members
	/ministries/create/page: /ministries/create
	/ministries/page: /ministries
	/page: /
	/test-api/page: /test-api
	/test-force-camera/page: /test-force-camera
	/test-scanner/page: /test-scanner
gbihal1@gbihal1:/www/wwwroot/gbihal1.server.my/churchManagement$ 
