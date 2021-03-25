// Simple GEDCOM file parser, just enough smarts to build a list of objects with properties

// Functions give us a new closure/namespace to avoid pollution, and provide a constructor..
function Gedcom(input, cb) {
    // NB: Privacy indicated by use of _prefix
    // Init _data store & parser state
    // _data holds an array of tagged level 0 objects, each with a list of suborinate tagged objects..
    this._data = [];
    // _data accessors/filters
    this.count = function() {
        return this._data.length;
    }
    this.filter = function(tag) {
        return this._data.filter(node => node.tag==tag);
    }
    // current _data entry we are building
    this._current = null;
    // move to a new level 0 object
    this._next = function() {
        this._current = {};
        this._data.push(this._current);
    }
    // move to a new subordinate object
    this._nsub = function() {
        if (this._current.parent) {
            // we are in a subordinate, navigate back to parent
            this._current = this._current.parent;
        }
        let sub = {};
        sub.parent = this._current;
        this._current.subs.push(sub);
        // navigate to subordinate object
        this._current = sub;
    }
    this._parse = function(line, num) {
        // first trim, then split the line into <level> [@<pointer>@] <tag> [value]
        let toks = line.trim().split(' ');
        if (toks.length<2) {
            console.warn('gedcom(): invalid line@'+num+': '+line);
            return false;
        }
        // parse fields
        let level = parseInt(toks[0]);
        let point, tag, value;
        if ('@'==toks[1][0]) {
            point = toks[1];
            tag = toks[2];
            value = toks.slice(3).join(' ');
        } else {
            point = '';
            tag = toks[1];
            value = toks.slice(2).join(' ');
        }
        // check for level 0, start next object
        if (0==level) {
            this._next();
            this._current.level = level;
            this._current.tag = tag;
            this._current.point = point;
            this._current.value = value;
            this._current.subs = [];
            this._current.parent = null;
            return true;
        }
        // check for CONC or CONT tags, append to existing value
        if ('CONT'==tag) {
            value = '\n'+value;
        }
        if ('CONC'==tag || 'CONT'==tag) {
            this._current.value += value;
            return true;
        }
        // any other tag, becomes a subordinate of current level 0 object
        this._nsub();
        // fill it out
        this._current.level = level;
        this._current.tag = tag;
        this._current.point = point;
        this._current.value = value;
        this._current.subs = null;
        return true;
    }
    this.load = async function (input, cb) {
        // if supplied parameter is a ReadableStream, we read it chunk-by-chunk, assemble lines,
        if (input instanceof ReadableStream) {
            const rdr = input.getReader();
            const utf8 = new TextDecoder();
            let tail = '';
            let cnt = 0;
            let {value: chunk, done: rd} = await rdr.read();
            while (!rd) {
                let txt = utf8.decode(chunk, {stream:true});
                while (txt.length>0) {
                    let off = txt.indexOf('\n');
                    if (off<0) {
                        tail = txt;
                        break;
                    }
                    this._parse(tail+txt.substr(0, off), ++cnt);
                    tail = '';
                    txt = txt.substr(off+1);
                }
                ({value: chunk, done: rd} = await rdr.read());
            }
        // if it's an array-like object, we iterate it,
        } else if (input instanceof Array) {
            input.forEach((l,i) => this._parse(l,i));
        // if it's a string, we split on newlines and iterate it.
        } else if (typeof(input) === 'string') {
            const arr = input.split(/\n/);
            arr.forEach((l,i) => this._parse(l,i));
        } else {
            throw Error('gedcom(): supplied input argument is not one of: ReadableStream, Array, String');
        }
        // let the caller know we're done, pass back a reference to our closure
        if (cb)
            cb(this);
        return this;
    }
}
