FROM alpine:3.20

ARG PB_VERSION=0.27.0
ARG TARGETARCH

RUN apk add --no-cache ca-certificates curl unzip \
	&& curl -Lo /tmp/pocketbase.zip "https://github.com/pocketbase/pocketbase/releases/download/v${PB_VERSION}/pocketbase_${PB_VERSION}_linux_${TARGETARCH}.zip" \
	&& unzip /tmp/pocketbase.zip -d /pb \
	&& rm /tmp/pocketbase.zip \
	&& chmod +x /pb/pocketbase

WORKDIR /pb

COPY pb_migrations ./pb_migrations
COPY pb_hooks ./pb_hooks
COPY entrypoint.sh ./entrypoint.sh
COPY pb_public ./pb_public
RUN chmod +x ./entrypoint.sh

EXPOSE 8090

ENTRYPOINT ["./entrypoint.sh"]
