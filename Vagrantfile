Vagrant.configure("2") do |config|
  config.vm.define "ubuntu-20.04" do |instance|
    instance.vm.synced_folder ".", "/home/vagrant/src"
    instance.vm.provision "shell", inline: "ls /home/vagrant && cd /home/vagrant/src && apt-get update && apt-get -y install nodejs npm && npm install && node dist/index.js local"
    instance.vm.box = "ubuntu/focal64"
  end
end
