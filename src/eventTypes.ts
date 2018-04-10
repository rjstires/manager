export function baseRedirect() {
  return '/';
}

export function getLinodesRedirectUrl() {
  return '/linodes';
}

export function getLinodeRedirectUrl(entity: Linode.Entity) {
  return `${getLinodesRedirectUrl()}/${entity.label}`;
}

export function getLinodeNetworkingRedirectUrl(entity: Linode.Entity) {
  return `${getLinodeRedirectUrl(entity)}/networking`;
}

export function getLinodeAdvancedRedirectUrl(entity: Linode.Entity) {
  return `${getLinodeRedirectUrl(entity)}/settings/advanced`;
}

export function getLinodeBackupRedirectUrl(entity: Linode.Entity) {
  return `${getLinodeRedirectUrl(entity)}/backups`;
}

export function getDomainsRedirectUrl() {
  return '/domains';
}

export function getDomainRedirectUrl(entity: Linode.Entity) {
  return `${getDomainsRedirectUrl()}/${entity.label}`;
}

export function getNodeBalancersRedirectUrl() {
  return '/nodebalancers';
}

export function getNodebalancerRedirectUrl(entity: Linode.Entity) {
  return `${getNodeBalancersRedirectUrl()}/${entity.label}`;
}

export function getTicketsRedirectUrl() {
  return '/support';
}

export function getTicketRedirectUrl(entity: Linode.Entity) {
  return `${getTicketsRedirectUrl()}/${entity.id}`;
}

export function getStackScriptsRedirectUrl() {
  return '/stackscripts';
}

export function getStackScriptRedirectUrl(entity: Linode.Entity) {
  return `${getStackScriptsRedirectUrl()}/${entity.id}`;
}

export function getVolumesRedirectUrl() {
  return '/volumes';
}

export function getVolumeRedirectUrl() {
  return getVolumesRedirectUrl();
}

export function getImagesRedirectUrl() {
  return '/images';
}

export function getImageRedirectUrl() {
  return getImagesRedirectUrl();
}

export function getAccountRedirectUrl() {
  return '/account';
}

const EventTypeMap = {
  linode_boot: {
    presentTenseAction: 'Booting',
    pastTenseAction: 'booted',
    linodeStatus: 'running',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_create: {
    presentTenseAction: 'Provisioning',
    pastTenseAction: 'provisioned',
    linodeStatus: 'offline', // Technically this is "finished", but offline is more useful to us.
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getLinodesRedirectUrl,
  },
  linode_shutdown: {
    presentTenseAction: 'Shutting down',
    pastTenseAction: 'shut down',
    linodeStatus: 'offline',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_reboot: {
    presentTenseAction: 'Rebooting',
    pastTenseAction: 'rebooted',
    linodeStatus: 'running',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_addip: {
    presentTenseAction: 'Adding an IP to',
    pastTenseAction: '',
    pastTensePrefix: 'IP added to',
    redirectUrl: getLinodeNetworkingRedirectUrl,
  },
  linode_deleteip: {
    presentTenseAction: 'Deleting an IP from',
    pastTenseAction: '',
    pastTensePrefix: 'IP deleted from',
    redirectUrl: getLinodeNetworkingRedirectUrl,
  },
  linode_migrate: {
    presentTenseAction: 'Migrating',
    pastTenseAction: 'migrated',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_rebuild: {
    presentTenseAction: 'Rebuilding',
    pastTenseAction: 'rebuilt',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_resize: {
    presentTenseAction: 'Resizing',
    pastTenseAction: 'resized',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_clone: {
    presentTenseAction: 'Cloning',
    pastTenseAction: 'cloned',
    redirectUrl: getLinodeRedirectUrl,
  },
  linode_kvmify: {
    presentTenseAction: 'KVMifying',
    pastTenseAction: 'kvmified',
    redirectUrl: getLinodeRedirectUrl,
  },

  disk_create: {
    presentTenseAction: 'Creating disk on',
    pastTenseAction: 'created',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl,
  },
  disk_delete: {
    presentTenseAction: 'Deleting disk on',
    pastTenseAction: 'deleted',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl,
  },
  disk_duplicate: {
    presentTenseAction: 'Duplicating disk on',
    pastTenseAction: 'duplicated',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl,
  },
  disk_resize: {
    presentTenseAction: 'Resizing disk on',
    pastTenseAction: 'resized',
    pastTensePrefix: 'Disk on',
    redirectUrl: getLinodeAdvancedRedirectUrl,
  },
  disk_imagize: {
    presentTenseAction: 'Creating an image from ',
    pastTenseAction: 'scheduled for image creation',
    pastTensePrefix: 'Disk on',
    redirectUrl: getImagesRedirectUrl,
  },
  linode_snapshot: {
    presentTenseAction: 'Taking a snapshot of',
    pastTenseAction: 'taken',
    pastTensePrefix: 'Snapshot of',
    redirectUrl: getLinodeBackupRedirectUrl,
  },
  backups_enable: {
    presentTenseAction: 'Enabling backups service',
    pastTenseAction: 'backups enabled',
    redirectUrl: getLinodeBackupRedirectUrl,
  },
  backups_cancel: {
    presentTenseAction: 'Cancelling backups service',
    pastTenseAction: 'backups service cancelled',
    redirectUrl: getLinodeBackupRedirectUrl,
  },
  backups_restore: {
    presentTenseAction: 'Restoring from backup',
    pastTenseAction: '',
    pastTensePrefix: 'Backup restored to',
    redirectUrl: getLinodeRedirectUrl,
  },

  password_reset: {
    presentTenseAction: 'Resetting password for',
    pastTenseAction: 'reset',
    pastTensePrefix: 'Password for',
    redirectUrl: getLinodeRedirectUrl,
  },

  domain_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getDomainRedirectUrl,
  },
  domain_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getDomainsRedirectUrl,
  },

  domain_record_create: {
    presentTenseAction: 'Creating record on',
    pastTenseAction: 'created',
    pastTensePrefix: 'Record on',
    redirectUrl: getDomainRedirectUrl,
  },
  domain_record_delete: {
    presentTenseAction: 'Deleting record on',
    pastTenseAction: 'deleted',
    pastTensePrefix: 'Record on',
    redirectUrl: getDomainsRedirectUrl,
  },

  nodebalancer_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getNodeBalancersRedirectUrl,
  },
  nodebalancer_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getNodeBalancersRedirectUrl,
  },
  nodebalancer_config_create: {
    presentTenseAction: 'Creating config on',
    pastTenseAction: 'created',
    pastTensePrefix: 'Config on',
    redirectUrl: getNodebalancerRedirectUrl,
  },
  nodebalancer_config_delete: {
    presentTenseAction: 'Deleting config on',
    pastTenseAction: 'deleted',
    pastTensePrefix: 'Config on',
    redirectUrl: getNodebalancerRedirectUrl,
  },

  stackscript_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getStackScriptRedirectUrl,
  },
  stackscript_publicize: {
    presentTenseAction: 'Publicizing',
    pastTenseAction: 'publicized',
    redirectUrl: getStackScriptRedirectUrl,
  },
  stackscript_revise: {
    presentTenseAction: 'Revising',
    pastTenseAction: 'revised',
    redirectUrl: getStackScriptRedirectUrl,
  },
  stackscript_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getStackScriptsRedirectUrl,
  },

  ticket_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getTicketRedirectUrl,
  },
  ticket_update: {
    presentTenseAction: 'Replying',
    pastTenseAction: '',
    pastTensePrefix: 'Reply posted to',
    redirectUrl: getTicketRedirectUrl,
  },
  ticket_attachment_upload: {
    presentTenseAction: 'Attachment uploading',
    pastTenseAction: '',
    pastTensePrefix: 'Attachment uploaded to',
    redirectUrl: getTicketRedirectUrl,
  },

  volume_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getVolumeRedirectUrl,
  },
  volume_attach: {
    presentTenseAction: 'Attaching',
    pastTenseAction: 'attached',
    redirectUrl: getLinodeAdvancedRedirectUrl,
  },
  volume_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getVolumesRedirectUrl,
  },
  volume_detach: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getVolumeRedirectUrl,
  },
  volume_resize: {
    presentTenseAction: 'Resizing',
    pastTenseAction: 'resized',
    redirectUrl: getVolumeRedirectUrl,
  },
  volume_clone: {
    presentTenseAction: 'Cloning',
    pastTenseAction: 'cloned',
    redirectUrl: getVolumesRedirectUrl,
  },

  image_create: {
    presentTenseAction: 'Creating',
    pastTenseAction: 'created',
    redirectUrl: getImageRedirectUrl,
  },
  image_delete: {
    presentTenseAction: 'Deleting',
    pastTenseAction: 'deleted',
    redirectUrl: getImagesRedirectUrl,
  },

  credit_card_updated: {
    pastTensePrefix: 'Credit card updated by',
    redirectUrl: getAccountRedirectUrl,
  },
  payment_submitted: {
    pastTensePrefix: 'Payment submitted by',
    redirectUrl: getAccountRedirectUrl,
  },
  community_question_reply: {
    pastTensePrefix: 'replied',
  },
};

export default EventTypeMap;
