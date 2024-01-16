instalar zk sync dentro de vm

* paso 1   descargar repo clonar develop branch  
````
git clone --branch develop https://repositorio-asi.buenosaires.gob.ar/secictd/identidad-soberana/api-zksynk.git
````
* paso 2 - bajar docker compose 
````
sudo curl -L https://github.com/docker/compose/releases/download/1.29.1/docker-compose-%60uname -s-uname -m` -o /usr/local/bin/docker-compose
````
* paso 3 - dar permiso de ejecucion docker-compose
````
sudo chmod +x /usr/local/bin/docker-compose
````

* paso 4 - buildear imagen
````
cd api-zksync/source
````

```
docker build .
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
