# Development

Builds tested with:
* node 10.8.0
* npm 6.4.0

Build files

```
# cleanup old build
rm -rf applications/lupapiste/build/package/resources/public/oskari/

# Prepare for build
cd tools
npm install
npm install grunt-cli
grunt release:1.0:../applications/lupapiste/map/minifierAppSetup.json
```

Create [Leiningen checkouts](https://github.com/technomancy/leiningen/blob/stable/doc/TUTORIAL.md#user-content-checkout-dependencies)
to main lupapiste repository with `ln -s {path-to-oskari}/applications/lupapiste/build/package/ checkouts/oskari`.

Open Oskari map from Lupapiste. It should open fullmap.html from `applications/lupapiste/build/package/resources/public/oskari/` path.

To recompile Javascript changes, run `grunt release:1.0:../applications/lupapiste/map/minifierAppSetup.json` again.


# Deploying to Clojars

1. In applications/lupapiste/build/package folder:
  1. Bump version numbers in fullmap.html
  2. Bump version number in project.clj
2. Push new version to 'lupapiste' branch in Github
3. In Jenkins, Run `oskari-frontend-build` to build package with `grunt`.
4. Run `oskari-clojars-deploy` job to deploy to Clojars.
5. After a coffee break, check that new version is updated to [Clojars](https://clojars.org/lupapiste/oskari)
6. Use new versionin Lupapiste repoistory by updating project.clj.


# Updating Oskari

Custom code for Lupapiste exists in repository, so when merging upstream branches to Lupapiste most likely some needed configurations are wiped out.

When merging, check that these parts are not touched by merge:

* `bundles/framework/prinout/view/BasicPrintout.js`
** The Oskari default URL does not work with Lupapiste infrastructure, so URL needs to be handcrafted for Lupapiste
** See commit `d1730de6a1c8abc947a8609d3150b25198d41852` for example
* `tools/Gruntfile.js` - this build file is heavily modified for Lupapiste Oskari build process, check that it's not compromised in merges

For functional checking, test at least these features after merge:
* Saving own places/drawings
** Special check: draw a line and then define it's width: it will be converted to Polygon. Check that it's actually converted!
* Map printout
** Both preview thumbnails and actual printing
