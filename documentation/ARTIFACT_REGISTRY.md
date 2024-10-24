# Artifact Registry

## Info

- Artifact registry is same like docker hub where we can store docker image privately.
- There is one `orderna-repository` repository where `orderna-api-dev` & `orderna-api-prod` images are being pushed through github pipeline.
- Each image will have short commit ref as tag which will to identify the code base from which this image is being generated.
- By default the latest `dev` and `prod` will have `dev` and `prod` tag attached to image.
- Right now there is no Cleanup policies for removal of old images.
