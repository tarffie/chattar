# syntax=docker/dockerfile:1
ARG RUST_VERSION=1.98.0
ARG APP_NAME=backend-rust

FROM rust:${RUST_VERSION}-alpine AS build

ARG APP_NAME
WORKDIR /app

RUN apk update && apk upgrade 
RUN apk add --no-cache clang lld musl-dev git 

COPY . .

RUN --mount=type=bind,source=src,target=src \
    --mount=type=bind,source=Cargo.toml,target=Cargo.toml \
    --mount=type=bind,source=Cargo.lock,target=Cargo.lock \
    --mount=type=cache,target=/app/target/ \
    --mount=type=cache,target=/var/cache/cargo \
    CARGO_HOME=/var/cache/cargo cargo build --locked --release && \
    cp ./target/release/$APP_NAME /bin/server

FROM docker.io/library/alpine:3.18 AS final
# Create a non-privileged user (recommended best practice)
ARG UID=10001
RUN adduser \
    --disabled-password \
    --gecos "" \
    --home "/nonexistent" \
    --shell "/sbin/nologin" \
    --no-create-home \
    --uid "${UID}" \
    developer

# Drop privileges for runtime.
USER developer

# Copy only the compiled binary from the build stage.
COPY --from=build /bin/server /bin/

# Rocket: listen on all interfaces inside the container.
ENV ROCKET_ADDRESS=0.0.0.0

# Document the port your app listens on.
EXPOSE 4040

# Start the application.
CMD ["/bin/server"]
