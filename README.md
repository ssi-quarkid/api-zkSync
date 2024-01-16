instalar zk sync dentro de vm

* paso 1   descargar e instalar docker, docker- compose ,s2i
````
sudo dnf config-manager --add-repo=https://download.docker.com/linux/centos/docker-ce.repo
sudo yum repolist
sudo dnf install docker-ce
sudo systemctl start docker
sudo systemctl enable docker
````
````
sudo curl -L "https://github.com/docker/compose/releases/download/1.29.1/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
````

````
wget https://github.com/openshift/source-to-image/releases/download/v1.3.6/source-to-image-v1.3.6-cd7d7ce9-linux-amd64.tar.gz
sudo tar -xvzf ./source-to-image-v1.3.6-cd7d7ce9-linux-amd64.tar.gz
sudo cp ./s2i /usr/local/bin
````

* paso 3 - dar permiso de ejecucion docker-compose
````
sudo chmod +x /usr/local/bin/docker-compose
````

* paso 4 - buildear imagen


```
s2i build https://repositorio-asi.buenosaires.gob.ar/secictd/identidad-soberana/api-zksynk.git -r {TAG A GENERAR} --context-dir source registry.access.redhat.com/ubi8/nodejs-18:latest api-zksynk-s2i |& tee /tmp/api-zksynk-s2i-build.log
```

* paso 5 - podman sockets

````
sudo systemctl start podman.socket
````
````
sudo systemctl status podman.socket
````

* paso 6 - docker-compose up
ya que la app no tiene permiso para crear la bbdd en mongo,
crear base de datos en mongo de produccion ( y agregar ruta al mongo en el docker compose), "modena-zksync-testnet-v1"

````
/usr/local/bin/docker-compose -f docker-compose-zk-prod.yml up
````
* paso 7 - servicio de rebooteo
````
podman generate systemd --files --name source_modenav4_1
````
````
cp -Z  container-source_modenav4_1.service  /etc/systemd/system
````
````
sudo systemctl daemon-reload
````
````
sudo loginctl enable-linger
..