
define(function() {
    var globals = {};

    /**
     * @method $
     *
     * @param {string} key   Key
     * @param          value Value       
     *
     * @return value of key or all "globals" if not specified
     */
    var globalsFunc = function (key, value) {
        if (key === undefined) {
            return globals;
        }
        if (value !== undefined) {
            globals[key] = value;
        }
        return globals[key];
    };

    return globalsFunc;
});