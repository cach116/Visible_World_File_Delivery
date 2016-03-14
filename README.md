# Visible World File Delivery


To start the server, you can either run `npm start` or `node bin/www`

To populate the API with random, sample data run `mocha` for as many times as you'd like.

## `GET /hosts`

Returns an array of all hosts

### Example Response

```
["A","B","C"...]
```

## `POST /host`

Adds a new host to the list

### Parameters

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Required?</th>
            <th width="50">Type</th>
            <th width=100%>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>name</code></td>
            <td>required</td>
            <td>string</td>
            <td>Name of the host to add</td>
        </tr>
    </tbody>
</table>


### Example Response

If successful:

```
{success: true}
```
### Errors

`409` if the host already exists

## `GET /links`

Returns a multidimensional object of all the links

### Example Response

```
{
	"a": [
	  {
		  "description": "rsync",
		  "dest": "e"
  	},
	  {
		  "description": "ftpc",
		  "dest": "f"
	  }
	],
	"b": [
	  {
		  "description": "samba",
		  "dest": "q"
	  }
	],
}
```

## `POST /link`

Create a new link between two hosts

### Parameters

<table>
    <thead>
        <tr>
            <th>Name</th>
            <th>Required?</th>
            <th width="50">Type</th>
            <th width=100%>Description</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td><code>host</code></td>
            <td>required</td>
            <td>string</td>
            <td>Name of the origin host</td>
        </tr>
        <tr>
            <td><code>description</code></td>
            <td>required</td>
            <td>string</td>
            <td>Type of protocol to use</td>
        </tr>
        <tr>
            <td><code>dest</code></td>
            <td>required</td>
            <td>string</td>
            <td>Name of the destination host</td>
        </tr>
    </tbody>
</table>

### Example Response

If successful:

```
{success: true}
```
### Errors

`409` if the link already exists




