# ----------------------------------------------------------------------
# Stage 1: 환경 설정
# ----------------------------------------------------------------------
FROM node:20.19.1-alpine3.21 AS base
LABEL stage=base

# Alpine Linux: 가벼운 환경을 위해 libc6-compat 추가
RUN apk add --no-cache libc6-compat && apk update

# Corepack 활성화
RUN corepack enable
RUN corepack prepare pnpm@8.15.6 --activate
RUN pnpm config set store-dir ~/.pnpm-store


# ----------------------------------------------------------------------
# Dev Stage: 개발 환경을 위한 이미지
# ----------------------------------------------------------------------
FROM base AS dev
LABEL stage=dev

WORKDIR /app


#비루트 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 프로젝트 의존성 설치 (Monorepo 필터링)
USER nextjs
# apps/knockdog 의존성만 설치하여 가볍게 유지
RUN pnpm install --filter=knockdog...

# 전체 파일 복사 및 개발 서버 실행
COPY . .
EXPOSE 3000
CMD ["pnpm", "dlx", "turbo", "run", "dev", "--filter=knockdog..."]


# ----------------------------------------------------------------------
# Runner Stage: Production SSR 서버
# ----------------------------------------------------------------------
FROM node:20.19.1-alpine3.21 AS runner
LABEL stage=runner
WORKDIR /app

ARG PROJECT

RUN echo ">> Build Arg PROJECT=${PROJECT}"


#비루트 사용자 생성
RUN addgroup --system --gid 1001 nodejs \
 && adduser --system --uid 1001 nextjs

 # CI에서 pre-built 산출물 복사
 USER nextjs
 COPY --chown=nextjs:nodejs apps/${PROJECT}/.next/standalone ./
 COPY --chown=nextjs:nodejs apps/${PROJECT}/next.config.js ./
 COPY --chown=nextjs:nodejs apps/${PROJECT}/package.json ./

 # 환경 변수 및 포트
 ENV NODE_ENV=production
 ENV PORT=3000
 EXPOSE 3000

 # 서버 실행
 CMD ["node", "server.js"]  

