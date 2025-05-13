# ----------------------------------------------------------------------
# Stage 1: 환경 설정
# ----------------------------------------------------------------------
FROM node:20.19.1-alpine3.21 AS base
LABEL stage=base

# Alpine Linux: 가벼운 환경을 위해 libc6-compat 추가
RUN apk add --no-cache libc6-compat
RUN apk update

# Corepack 활성화
RUN corepack enable
RUN corepack prepare pnpm@8.15.6 --activate
RUN pnpm config set store-dir ~/.pnpm-store

# ----------------------------------------------------------------------
# Stage 2: Pruner - Turbo Prune
# ----------------------------------------------------------------------
FROM base AS pruner
LABEL stage=pruner

ARG PROJECT
ARG ENV_FILE

# 작업 디렉토리 설정
WORKDIR /app

# 전체 소스코드 복사
COPY . .

# ENV 환경에 맞게 세팅
RUN find . -name ".env.*" -exec rm {} \;
COPY apps/${PROJECT}/${ENV_FILE} apps/${PROJECT}
RUN mv apps/${PROJECT}/${ENV_FILE} apps/${PROJECT}/.env.production

# Turbo Prune 실행
RUN pnpm dlx turbo prune --scope=${PROJECT} --docker

# ----------------------------------------------------------------------
# Stage 3: Builder - Pruned된 소스 기반으로 종속성 설치 및 빌드
# ----------------------------------------------------------------------
FROM base AS builder
LABEL stage=builder

ARG PROJECT

WORKDIR /app

# Pruner 스테이지의 'out' 디렉토리에서 prune된 결과물 복사
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=pruner /app/out/pnpm-workspace.yaml ./pnpm-workspace.yaml

# 종속성 설치
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm install --frozen-lockfile --ignore-scripts

# Pruner 스테이지의 'out' 디렉토리에서 prune된 전체 소스코드 복사
COPY --from=pruner /app/out/full/ .

# 애플리케이션 빌드
RUN pnpm dlx turbo run build --filter=${PROJECT}...

# 프로덕션 종속성만 남기기
RUN --mount=type=cache,id=pnpm,target=~/.pnpm-store pnpm prune --prod --no-optional

# ----------------------------------------------------------------------
# Stage 4: Runner - 최종 런타임 환경
# ----------------------------------------------------------------------
FROM base AS runner
LABEL stage=runner

ARG PROJECT

WORKDIR /app

# 사용자 및 그룹 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 권한을 nextjs 사용자로 설정
USER nextjs

# 필수 파일 복사
COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/next.config.js .
COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/package.json .

# standalone 빌드 결과 복사
COPY --from=builder --chown=nextjs:nodejs /app/apps/${PROJECT}/.next/standalone ./

USER nextjs

WORKDIR /app/apps/${PROJECT}

# 포트 설정
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

# 서버 실행 (standalone 기반)
CMD ["node", "server.js"]

