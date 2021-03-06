# config valid for current version and patch releases of Capistrano
lock "~> 3.11.0"

set :application, "tf18"
set :repo_url, "git@gitlab.alxndr.de:alex/tf18.git"

# Default branch is :master
# ask :branch, `git rev-parse --abbrev-ref HEAD`.chomp

# Default deploy_to directory is /var/www/my_app_name
# set :deploy_to, "/var/www/my_app_name"

# Default value for :format is :airbrussh.
# set :format, :airbrussh

# You can configure the Airbrussh format using :format_options.
# These are the defaults.
# set :format_options, command_output: true, log_file: "log/capistrano.log", color: :auto, truncate: :auto

# Default value for :pty is false
# set :pty, true

# Default value for :linked_files is []
# append :linked_files, "config/database.yml"

# Default value for linked_dirs is []
# append :linked_dirs, "log", "tmp/pids", "tmp/cache", "tmp/sockets", "public/system"
append :linked_dirs, "tmp/cache", "tmp/uploads", "public/system", "public/uploads"

# Default value for default_env is {}
# set :default_env, { path: "/opt/ruby/bin:$PATH" }

# Default value for local_user is ENV['USER']
# set :local_user, -> { `git config user.name`.chomp }

# Default value for keep_releases is 5
# set :keep_releases, 5

# Uncomment the following to require manually verifying the host key before first deploy.
# set :ssh_options, verify_host_key: :secure

##### Need change to your own configs BEGIN: #####
server 'app1.alxndr.de', port: 22, roles: [:web, :app, :db], primary: true

set :repo_url,        "git@gitlab.alxndr.de:alex/tf18.git"
set :application,     'tf18'  
set :user,            'deploy'  
set :puma_threads,    [4, 16]  
set :puma_workers,    3

set :stages, ["production"]
set :default_stage, "production"
##### Need change to your own configs END: #####

# Don't change these unless you know what you're doing
set :rbenv_ruby,      '2.4.2'  
set :pty,             true  
set :use_sudo,        false  
set :stage,           :production  
set :deploy_via,      :remote_cache  
set :deploy_to,       "/home/#{fetch(:user)}/apps/#{fetch(:application)}"  
set :puma_bind,       "unix://#{shared_path}/tmp/sockets/#{fetch(:application)}-puma.sock"  
set :puma_state,      "#{shared_path}/tmp/pids/puma.state"  
set :puma_pid,        "#{shared_path}/tmp/pids/puma.pid"  
set :puma_access_log, "#{release_path}/log/puma.error.log"  
set :puma_error_log,  "#{release_path}/log/puma.access.log"  
set :ssh_options,     { forward_agent: true, user: fetch(:user), keys: %w(~/.ssh/id_rsa.pub) }  
set :puma_preload_app, true  
set :puma_worker_timeout, nil  
set :puma_init_active_record, true  # Change to false when not using ActiveRecord


require 'capistrano-db-tasks'

# if you haven't already specified
set :rails_env, "production"

# if you want to remove the local dump file after loading
set :db_local_clean, true

# if you want to remove the dump file from the server after downloading
set :db_remote_clean, true

# if you want to exclude table from dump
set :db_ignore_tables, []

# if you want to exclude table data (but not table schema) from dump
set :db_ignore_data_tables, []

# configure location where the dump file should be created
set :db_dump_dir, "./db"

# If you want to import assets, you can change default asset dir (default = system)
# This directory must be in your shared directory on the server
# set :assets_dir, %w(public/assets public/att)
# set :local_assets_dir, %w(public/assets public/att)

# if you want to work on a specific local environment (default = ENV['RAILS_ENV'] || 'development')
# set :locals_rails_env, "production"

# if you are highly paranoid and want to prevent any push operation to the server
# set :disallow_pushing, true

# if you prefer bzip2/unbzip2 instead of gzip
# set :compressor, :bzip2



namespace :puma do  
  desc 'Create Directories for Puma Pids and Socket'
  task :make_dirs do
    on roles(:app) do
      execute "mkdir #{shared_path}/tmp/sockets -p"
      execute "mkdir #{shared_path}/tmp/pids -p"
    end
  end

  before :start, :make_dirs
end

namespace :deploy do  
  desc "Make sure local git is in sync with remote."
  task :check_revision do
    on roles(:app) do
      unless `git rev-parse HEAD` == `git rev-parse origin/master`
        puts "WARNING: HEAD is not the same as origin/master"
        puts "Run `git push` to sync changes."
        exit
      end
    end
  end

  desc 'Initial Deploy'
  task :initial do
    on roles(:app) do
      before 'deploy:restart', 'puma:start'
      invoke 'deploy'
    end
  end

  desc 'Restart application'
  task :restart do
    on roles(:app), in: :sequence, wait: 5 do
      invoke 'puma:restart'
    end
  end

  before :starting,     :check_revision
  after  :finishing,    :compile_assets
  after  :finishing,    :cleanup
  after  :finishing,    :restart
end  