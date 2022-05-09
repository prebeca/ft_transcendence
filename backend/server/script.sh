npm install -g npm@8.8.0
<<<<<<< HEAD

npm install
=======
# if ! [[ -d node_modules ]];
# then
# 	echo "installing node_module !"
	npm install
# fi
>>>>>>> 7f5467f95398696afc9e5172d732487664716144

umask 0000
exec npm run start:dev
