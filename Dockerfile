ARG NODE_IMAGE=docker.xuanyuan.run/node:22-alpine

FROM ${NODE_IMAGE} AS builder

WORKDIR /build

ARG NPM_REGISTRY=https://registry.npmjs.org
RUN npm config set registry ${NPM_REGISTRY}

COPY package.json package-lock.json ./
RUN npm ci

COPY . ./
RUN npm run build
