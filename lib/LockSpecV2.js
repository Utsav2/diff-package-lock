const path = require("path");

class LockSpecV2 {
  constructor(name, dirpath, rootSpec) {
    const { version, dependencies = {} } = rootSpec.packages[dirpath];
    Object.assign(this, {
      name,
      dirpath,
      version,
      dependencies,
      rootSpec,
    });
  }

  get(name) {
    const { dirpath, rootSpec } = this;
    const { packages } = rootSpec;
    // we basically search this using the node algorithm, but with keys
    let packDirpath;
    let currentPath;
    let nextPath = dirpath;
    while (!packDirpath && currentPath !== nextPath) {
      currentPath = nextPath;
      nextPath = path.posix.dirname(currentPath);
      const testDirpath = path.posix.join(currentPath, "node_modules", name);
      if (packages[testDirpath]) {
        packDirpath = testDirpath;
      }
    }

    if (!packDirpath) {
      const error = new Error(`can not find dependency ${name}`);
      error.code = "NOT_FOUND";
      throw error;
    }
    return new LockSpecV2(name, packDirpath, rootSpec);
  }

  getDependencies() {
    return Object.keys(this.dependencies).map((key) => this.get(key));
  }
}

module.exports = LockSpecV2;
