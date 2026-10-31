# Dev-only image for the Kite Go backend.
# It installs tooling and Go modules only; the application source is bind-mounted
# at /src by docker-compose.base44.yml so edits are picked up by air live reload.
FROM golang:1.24

RUN go install github.com/air-verse/air@v1.61.7

WORKDIR /src
COPY go.work go.work.sum ./
COPY kite-service/go.mod kite-service/go.sum ./kite-service/
COPY kite-web/go.mod kite-web/go.sum ./kite-web/
RUN cd kite-service && go mod download && cd ../kite-web && go mod download

WORKDIR /src/kite-service
