package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
	"mime/multipart"
	"net/http"
	"os"
	"strconv"
	"time"
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, "Hello World")
	})

	http.HandleFunc("/addFileToGitLabProject", func(w http.ResponseWriter, r *http.Request) {
		// fmt.Fprintf(w, "Hello World")

		switch r.Method {
		case http.MethodPost:
			privateToken := r.FormValue("privateToken")
			projectId := r.FormValue("projectId")
			fileName := r.FormValue("fileName")
			imageOrder := r.FormValue("imageOrder")

			file, _, err := r.FormFile("image")
			if err != nil {
				fmt.Println("Error Retrieving the File")
				fmt.Println(err)
				return
			}
			defer file.Close()

			// open output file
			fo, err := os.Create(fileName)
			if err != nil {
				panic(err)
			}
			// close fo on exit and check for its returned error
			defer func() {
				if err := fo.Close(); err != nil {
					panic(err)
				}
			}()

			// make a buffer to keep chunks that are read
			buf := make([]byte, 1024)
			for {
				// read a chunk
				n, err := file.Read(buf)
				if err != nil && err != io.EOF {
					panic(err)
				}
				if n == 0 {
					break
				}

				// write a chunk
				if _, err := fo.Write(buf[:n]); err != nil {
					panic(err)
				}
			}

			client := http.Client{
				Timeout: 20 * time.Second,
			}
			remoteURL := "https://gitlab.com/api/v4/projects/" + projectId + "/uploads"
			//prepare the reader instances to encode

			r, err := os.Open(fileName)
			if err != nil {
				panic(err)
			}

			values := map[string]io.Reader{
				"file": r,
			}

			response := Upload(client, remoteURL, values, privateToken)

			if err := os.Remove(fileName); err != nil {
				fmt.Println(err)
				return
			}

			type ReturnData struct {
				Number   int    `json:"number"`
				Markdown string `json:"markdown"`
			}
			var returnData ReturnData
			json.Unmarshal([]byte(response), &returnData)

			if n, err := strconv.Atoi(imageOrder); err == nil {
				returnData.Number = n
			} else {
				fmt.Println(imageOrder, "is not an integer.")
			}

			sampleJson, err := json.Marshal(returnData)

			if err != nil {
				fmt.Println(err)
				return
			}

			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusOK)
			w.Write(sampleJson)

		default:
			fmt.Fprintf(w, "Method not support")
			// Give an error message.
		}
	})

	s := http.Server{
		Addr:         ":9990",
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 10 * time.Second,
	}
	s.ListenAndServe()
}

func Upload(client http.Client, url string, values map[string]io.Reader, privateToken string) (bodyStr string) {
	// Prepare a form that you will submit to that URL.
	var err error
	var b bytes.Buffer
	w := multipart.NewWriter(&b)
	for key, r := range values {
		var fw io.Writer
		if x, ok := r.(io.Closer); ok {
			defer x.Close()
		}
		// Add an image file
		if x, ok := r.(*os.File); ok {
			if fw, err = w.CreateFormFile(key, x.Name()); err != nil {
				return
			}
		} else {
			// Add other fields
			if fw, err = w.CreateFormField(key); err != nil {
				return
			}
		}
		if _, err = io.Copy(fw, r); err != nil {
			return
		}

	}
	// Don't forget to close the multipart writer.
	// If you don't close it, your request will be missing the terminating boundary.
	w.Close()

	// Now that you have a form, you can submit it to your handler.
	req, err := http.NewRequest("POST", url, &b)

	if err != nil {
		return
	}
	// Don't forget to set the content type, this will contain the boundary.
	req.Header.Set("Content-Type", w.FormDataContentType())
	req.Header.Set("PRIVATE-TOKEN", privateToken)

	// Submit the request
	res, err := client.Do(req)
	if err != nil {
		return
	}
	defer res.Body.Close()

	// fmt.Println(res)
	// Check the response
	body, _ := ioutil.ReadAll(res.Body)
	bodyStr = string(body)
	// fmt.Println("response Body:", string(body))
	// if res.StatusCode != http.StatusOK {
	// 	err = fmt.Errorf("bad status: %s", res.Status)
	// }
	return
}

func mustOpen(f string) *os.File {
	r, err := os.Open(f)
	if err != nil {
		panic(err)
	}
	return r
}

func check(e error) {
	if e != nil {
		panic(e)
	}
}
