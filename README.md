This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## AWS Cognito integration

This template now includes client-side helpers to authenticate users with **Amazon Cognito** using the AWS Amplify Auth library.

To configure it locally:

1. Create a Cognito User Pool and an application client (App client) in the AWS console.
2. (Optional) Create an Identity Pool if you need temporary AWS credentials.
3. Add the following environment variables to a new `.env.local` file. They are all required unless otherwise noted:

   ```bash
   NEXT_PUBLIC_COGNITO_REGION=your-region
   NEXT_PUBLIC_COGNITO_USER_POOL_ID=your-user-pool-id
   NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID=your-app-client-id
   NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID=your-identity-pool-id # optional
   NEXT_PUBLIC_GRAPHQL_ENDPOINT=https://your-nest-backend/graphql
   ```

4. Install dependencies with `npm install` and start the development server (`npm run dev`).

Once configured, the `/signin` page will authenticate with Cognito (including Google federated sign-in when enabled) and the `/post-a-job` flow will require users to have an active Cognito session before they can submit the form.

## Despliegue con AWS Amplify

AWS Amplify elige automáticamente **pnpm** cuando detecta un `pnpm-lock.yaml`. Como el repositorio incluye dependencias nuevas para Cognito y las pruebas unitarias, el comando predeterminado `pnpm install --frozen-lockfile` puede fallar si el archivo de bloqueo no se actualiza en el mismo commit. Para evitarlo, el proyecto incluye un archivo `amplify.yml` que fuerza el uso de `npm install` durante la fase de _preBuild_. Amplify actualizará el `package-lock.json` y descargará las dependencias necesarias antes de ejecutar `npm run build`.

Si necesitas personalizar el proceso (por ejemplo, ejecutar pruebas o linters en la fase de _build_), edita `amplify.yml` y agrega los comandos adicionales en la sección `frontend.phases`.

## Integración con un backend NestJS + GraphQL

El formulario de **Post a job** envía la información al endpoint definido en `NEXT_PUBLIC_GRAPHQL_ENDPOINT`. Se espera que este endpoint sea provisto por un backend construido con [NestJS](https://docs.nestjs.com/) y su módulo de [GraphQL](https://docs.nestjs.com/graphql/quick-start) exponiendo una mutación parecida a:

```graphql
type Mutation {
  createJobPosting(input: CreateJobPostingInput!): JobPosting!
}

input CreateJobPostingInput {
  companyName: String!
  contactEmail: String!
  title: String!
  role: String!
  commitment: String!
  description: String!
  salary: String
  addOns: JobAddOnInput!
}

input JobAddOnInput {
  stick: Boolean!
  highlight: Boolean!
}
```

El cliente definido en `lib/graphql-client.ts` recupera el token de Cognito activo y lo envía en la cabecera `Authorization` como `Bearer`, de manera que el backend puede validar la sesión antes de registrar la vacante. Ajusta la mutación y los campos según la definición de tu API en NestJS.

## Pruebas

Este proyecto utiliza **Jest** junto con **Testing Library** para cubrir los componentes de interfaz creados con React y Next.js. Ejecuta la suite de pruebas con:

```bash
npm test
```

Jest resulta una buena elección para este escenario porque ofrece integración oficial con Next.js (`next/jest`), soporte para TypeScript y la posibilidad de simular dependencias como AWS Amplify, lo que facilita validar componentes que dependen de Cognito sin requerir una sesión real.
