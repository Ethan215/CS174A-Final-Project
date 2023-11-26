import {defs, tiny} from './examples/common.js';
import {Body, Simulation, Test_Data} from './examples/collisions-demo.js';
//import { Simulation } from './examples/control-demo.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Capped_Cylinder, Textured_Phong_text, Phong_Shader, Regular_2D_Polygon, Closed_Cone } = defs;



export class Main extends Simulation {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        
        

        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .52, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/blue.png")
            }),
            block2: new Material(new Textured_Phong(), {
                color: hex_color("#ff745e"),
                ambient: .6, diffusivity: .1, specularity: 0.5,
                texture: new Texture("assets/block.jpg")
            }),
            texture: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .1, diffusivity: .8, specularity: 0.5,
                texture: new Texture("assets/net21.png")
            }),
            net: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/net21.png")
            }),
            sky: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .5, diffusivity:.1, specularity: 0.1,
                texture: new Texture("assets/sky.png"),
            }),
            blank: new Material(new Textured_Phong(), {
                color: hex_color("#edef00"),
                ambient: .5, diffusivity: 1, specularity: .1,
                texture: new Texture("assets/white.jpeg")
            }),
            ball_skin: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.48, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/ball.png")
            }),
            grass: new Material(new Textured_Phong(), {
                color: hex_color("#00FF00"), // 绿色草地
                ambient: 0.4, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "LINEAR")

            })
 
        }
        this.shapes = {
            tube: new Cylindrical_Tube(1, 20),
            human: new HumanFigure(this.materials.phong, Mat4.scale(.8, .8, .8).times(Mat4.translation(0, 1.875, 0))),
            ///1.4/.8
            net: new soccerNet(this.materials.texture, Mat4.translation(0, 3, -30).times(Mat4.rotation(Math.PI, 0, 1, 0))),
            poly: new Regular_2D_Polygon(4, 2),
            box: new Cube(),
            block: new Block1(this.materials.phong, Mat4.translation(-6, 3, -8)),
            chick: new Chick(this.materials.blank, Mat4.translation(-8, 1.8, 3)),
            chicken:new Chicken(this.materials.blank, Mat4.translation(0 ,1.8, 0)),
            test: new Body(new Chick(this.materials.blank), this.materials.blank, vec3(3.8,7.5,2)),
            test4: new Body(new Chicken(this.materials.blank), this.materials.blank, vec3(3.8,7.5,2)),
            test2: new Body(new HumanFigure(this.materials.phong), this.materials.phong, vec3(3.8,7.5,2)),
            test3: new Body(new Subdivision_Sphere(4), this.materials.phong, vec3(2, 2, 2)),
            box2: new Te(this.materials.blank),
            block2: new Block2(this.materials.block2, Mat4.identity().times(Mat4.translation(0, 0.5+0.35, 0))),
            // ground: new Regular_2D_Polygon(100,100),
            // soccer field
            field: new Regular_2D_Polygon(100, 100), // 4个顶点，1表示矩形
            ball: new Soccer_ball(this.materials.ball_skin, Mat4.scale(0.7, 0.7, 0.7))

        }
        
        this.shapes.field.bound = new BoundingBox(0,0,0,100,1,100);
        this.backgroundMusic = new Audio('music/background_music.mp3');
        this.backgroundMusic.loop = true;
        

        this.moving = false
        this.forward = false
        this.back = false
        this.left = false
        this.right = false

        this.agent_pos = vec3(0, -.25, 30)
        this.ball_pos = vec3(0,0.7,29)  
        this.collision = false
        this.direction = 1
        this.first = false
        this.kick = false
        this.time = 0
        this.spin_angle = Math.PI
        this.linear_velocity_yz = vec3(0,0,0)
        this.initial_camera_location = Mat4.look_at(vec3(-15, 8, 40), vec3(5, 0, 0), vec3(0, 5, 0));
        this.ball_collision = false

        this.agent_pos = vec3(0, -.25, 30)  
        this.collision = false
        this.direction = 1
        this.first = false

        //把所有需要碰撞检测的东西（除了移动的主体以外放进这个列表里）
        
        //初始化障碍物位置，球网位置固定，鸡群只刷一只
        this.still_items = [this.shapes.net, this.shapes.chicken]
        //随机刷新的障碍物的种类
        this.types = ["block1", "chick", "block2"]
        //可调整： 随机生成障碍物的位置
        this.areas = [[Math.random() * (-11+21) -21, Math.random() * (20-10) +10], 
                        [Math.random() * (-11+21) -21, Math.random() * (-10+20) -20],
                        [Math.random() * (-11+21) -21, Math.random() * (5+5) -5], 
                        [Math.random() * (5+5) -5, Math.random() * (20-10) +10],
                        [Math.random() * (5+5) -5, Math.random() * (-10+20) - 20],
                        [Math.random() * (5+5) -5, Math.random() * (5+5) -5],
                        [Math.random() * (21-11) +11, Math.random() * (20-10) +10], 
                        [Math.random() * (21-11) +11, Math.random() * (-10+20) - 20],
                        [Math.random() * (21-11) +11, Math.random() * (5+5) -5]]
        //随机鸡群位置
        let random = Math.floor(Math.random() * (5-0) + 0)
        this.chicken_pos = this.areas[random]

        //必须保证鸡群刷新位置在bound最左侧，不然会发生障碍物之间的碰撞
        let counter = this.chicken_pos[0]
        if (counter <= -11) {counter = -21}
        else if (counter <= 5) {counter = -5}
        else {counter = 11}
        this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.translation(counter, 0, this.chicken_pos[1])) 

        //位置列表中去除鸡群位置
        this.areas.splice(random, 1)
        this.face = "forward" 
        this.agent_trans = Mat4.identity() // store the character's translation value
        this.agent_rot = vec4(0,0,0,0)   // store the character's rotation state 
        this.agent_size = 0.8      // scale
        this.length = 10
        this.temp = this.length
        this.chicken_direction = true
    
        //random_refresh: 填充this.still_items 列表，随机位置，随机物件
        for (let i of this.areas) {
            this.random_refresh(i)
        }
        
    }

 

    make_control_panel() {
        // "m" to controal the background_music
        this.key_triggered_button("Toggle Music", ["m"], () => {
            this.toggleMusic();
        });

        this.key_triggered_button("First Perspective", ["f"], () => {
            this.first = true
        });
        this.key_triggered_button("Third Perspective", ["t"], () => {
            this.first = false
        });
        
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => {
            this.moving = true
            this.forward = true 
            
        }, undefined, () => {
            this.moving = false
            this.forward = false
        });

        

        // Move backward
        this.key_triggered_button("Move Backward", ["ArrowDown"], () => {
            this.moving = true
            this.back = true
  


        }, undefined, () => {
            this.moving = false
            this.back = false
        });

        this.key_triggered_button("Move Left", ["ArrowLeft"], () => {
            this.moving = true
            this.left = true

        }, undefined, () => {
            this.moving = false
            this.left = false
        });

        this.key_triggered_button("Move Right", ["ArrowRight"], () => {
            this.moving = true
            this.right = true

        }, undefined, () => {
            this.moving = false
            this.right = false
        });

        this.key_triggered_button("Kick", ["k"], () =>{
            this.kick = true
            this.time = 0
            this.spin_angle = Math.PI
        })

    }

    // For key_triggered_button 'm' controal music
    playMusic() {
        this.backgroundMusic.play().catch(e => console.error("Error playing music:", e));
    }
    pauseMusic() {
        this.backgroundMusic.pause();
    }
    toggleMusic() {
        if (this.backgroundMusic.paused) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }

    // For stopping human after an obstacle collision
    stop_human_figure() {
        this.moving = false
        this.shapes.human.stop_swin()
    }
    
    //random_refresh: refresh the blocks in the given area
    random_refresh(area, type=this.types[Math.floor(Math.random()*this.types.length)]) {
        if (type == "block1")
        this.still_items.push(new Block1(this.materials.phong, Mat4.scale(.7,.7,.7).times(Mat4.translation(area[0], 3, area[1]))))
        if (type == "chick")
        this.still_items.push(new Chick(this.materials.blank, Mat4.translation(area[0], 1.8, area[1])))
        if (type == "block2")
        this.still_items.push(new Block2(this.materials.block2, Mat4.translation(area[0], 0.85, area[1])))
 
        
    }

    //鸡群移动，length = 10
    move_chicken(chicken, dt=this.dt) {
        let speed = 10
        let temp = dt*speed
            chicken.update_pos()
            chicken.update_bound()
            chicken.wobble(this.t, this.direction)
            
            if (this.chicken_direction) {
            chicken.model_transform[0][3] = chicken.model_transform[0][3] + temp
            }
            
            else {
                chicken.model_transform[0][3] = chicken.model_transform[0][3] - temp}

            return temp
    

    }


    find_reflecting_dir(initial_pos)
    {
        let direction = this.ball_pos.minus(initial_pos)
        return direction.times(-1)
    }
    kicking_ball(ball, dt=this.dt) {
        
        let prev_pos = this.ball_pos
        
        
        if(this.kick)
        {
            
            
            if (this.ball_collision) {
                //let dis = ball.center_x - 
                console.log("yes")
                //console.log("find_reflecting_dir(prev_pos)")
                //let new_dir = vec3(0,0,1)
                console.log(this.linear_velocity_yz[2])
                this.linear_velocity_yz[2] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = Math.sin(Math.PI/8)/10
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
                // this.linear_velocity_yz.add_by(new_dir);
                //this.ball_pos.add_by(new_dir)
                //this.ball_collision = false
                //this.ball_pos[1] += .3
            
            }
            else{
                this.linear_velocity_yz[2] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = -Math.sin(Math.PI/8)/10
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
                console.log(this.linear_velocity_yz[2])
                //console.log(this.ball_pos[1])
            }
            
                
            ball.model_transform = ball.model_transform.times(Mat4.rotation(-this.spin_angle,1,0,0))
                
            this.spin_angle *= 0.9;
            ++this.time;
                
                
        }
        
        if(this.ball_pos[1]<0.68)
        {
            this.kick = false;
            this.ball_collision = false;
            console.log("kick off")
            this.ball_pos[1] += .02
        }
            
    

    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)));
        }

        

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 100);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.t = program_state.animation_time / 1000;
        this.dt = program_state.animation_delta_time / 1000;
        
        //grass update
        for (let i = 0; i < this.shapes.field.arrays.texture_coord.length; ++i) {
            this.shapes.field.arrays.texture_coord[i].scale_by(12)
        } 
                                                    
        
        let speed = 10.0

        if (this.moving && ! this.collision) { 
            let speed = 10.0;
            this.shapes.human.swingArm(program_state.animation_time / 300)  // Changing the swing time
            this.shapes.human.swingLeg(program_state.animation_time / 300)
            if (this.forward) {
                if(this.face != "forward")
                {
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}  //Rotate 90° to the left
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;} //Rotate 90° to the right
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;} //Rotate 180° to the backward
                
                    this.face = "forward";
                }
                this.agent_pos[2] -= this.dt * speed;  // Decrease the human's Z-axis value
               
    
            }
            if (this.back) {
                
                if(this.face != "backward")
                {
                    
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    
                    this.face = "backward";
                }
                this.agent_pos[2] += this.dt * speed;
              
            }
            if (this.left) {
                
                if(this.face != "left")
                {
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
    
                    this.face = "left";
                }
                this.agent_pos[0] -= this.dt * speed;
                
            }
            if (this.right) {
                
                if(this.face != "right")
                {
                   
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    
                    this.face = "right";
                }
                this.agent_pos[0] += this.dt * speed;
                
            }
        
        }else if (this.collision) {
            //.2 is used to fine-tune the position of the character in the event of a collision, 
            //so that it can "move back" or "move away" from the colliding object slightly.
            if (this.face == "forward"){this.agent_pos[2] += .2} 
            if (this.face == "backward") {this.agent_pos[2] -= .2}
            if (this.face == "left") {this.agent_pos[0] += .2}
            if (this.face == "right") {this.agent_pos[0] -= .2}
            this.stop_human_figure()  // let move = false
            
        }
        else{this.stop_human_figure()}

            // 
            this.agent_trans = Mat4.translation(this.agent_pos[0], this.agent_pos[1], this.agent_pos[2]).times(Mat4.rotation(this.agent_rot[0],0,1,0)).
                times(Mat4.scale(this.agent_size,this.agent_size,this.agent_size));
    
            //Synchronizes the center position of a character model with its actual position in world space.
            this.shapes.human.center_x[0] = this.agent_pos[0]
            this.shapes.human.center_x[1] = this.agent_pos[1]
            this.shapes.human.center_x[2] = this.agent_pos[2]
            this.shapes.human.update_bound()

            this.shapes.human.draw(context, program_state, this.agent_trans)

            const check = (element) => this.shapes.human.bound.intersects(element.bound) == true
            const check2 = (element) => this.shapes.ball.bound.intersects(element.bound) == true

        if (this.still_items.some(check) || this.shapes.human.bound.intersects (this.shapes.ball.bound)) {
            //this.shapes.human.bound.find_face_normal(this.shapes.ball.bound)

            
        if (this.still_items.some(check)) {
            this.collision = true
        }
        else {
            this.collision = false
        }
        if (this.still_items.some(check2)&&this.kick) {

            this.ball_collision = true
            //console.log("oddd")
            //this.kick=false
        } 
        else if (this.shapes.field.bound.intersects2(this.shapes.ball.bound)) {
            //this.ball_collision = true
            
        }
        else {
            if(!this.kick)
            this.ball_collision = false
        }
        /* if (this.ball_pos[1] == 0) {this.kick = false
        this.ball_collision = true} */
        //if(this.kick ) {this.ball_collision = false}


    
        let field_transform = Mat4.identity()
                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0)) // Rotate to lay it flat
                        .times(Mat4.scale(80, 80, 80)); // Scale to the size of a soccer field
        this.shapes.field.draw(context, program_state, field_transform, this.materials.grass.override({color:hex_color("99ff66")}));
        
        // box 是表示四周的环境，我们可以改成其他的景色
        this.shapes.box.draw(context, program_state, Mat4.identity().times(Mat4.translation(0,-10,0)).times(Mat4.scale(30, 30, 40)), this.materials.sky)


        
        this.kicking_ball(this.shapes.ball)
        
        let ball_model_transform = Mat4.translation(this.ball_pos[0], this.ball_pos[1], this.ball_pos[2])
                                                    //.times(Mat4.rotation(Math.PI/8,0,1,0))
        this.shapes.ball.center_x[0] = this.ball_pos[0]
        this.shapes.ball.center_x[1] = this.ball_pos[1]
        this.shapes.ball.center_x[2] = this.ball_pos[2]
        this.shapes.ball.update_bound()
        this.shapes.ball.draw(context, program_state, ball_model_transform)
        
        
        
        //移动鸡，到距离转方向转面
        this.temp -= this.move_chicken(this.shapes.chicken)
        if (this.temp <= 0) {
            this.chicken_direction = !this.chicken_direction
            this.direction = - this.direction
            this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0))
            this.temp = this.length
        }

        //视角转换， this.first == true: 第一人称
        if (this.first) {
            console.log(this.agent_trans)
        program_state.camera_inverse = Mat4.translation(-this.agent_pos[0],this.agent_pos[1] - 5,-this.agent_pos[2]).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1))}
        else {program_state.set_camera(this.initial_camera_location)}
        //else {program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)))}

        //画障碍物
        for (let i of this.still_items) {
            i.draw(context, program_state, Mat4.identity(), this.materials.phong)
        } 

        //移动鸡，到距离转方向转面
        this.temp -= this.move_chicken(this.shapes.chicken)
        if (this.temp <= 0) {
            this.chicken_direction = !this.chicken_direction
            this.direction = - this.direction
            this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0))
            this.temp = this.length
        }

        //视角转换， this.first == true: 第一人称
        if (this.first) {
            console.log(this.agent_trans)
        program_state.camera_inverse = Mat4.translation(-this.agent_pos[0],this.agent_pos[1] - 5,-this.agent_pos[2]).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1))}
        else {program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)))}

        //画障碍物
        for (let i of this.still_items) {
            i.draw(context, program_state, Mat4.identity(), this.materials.phong)
        } 

        
    } 
}

    class SceneGraph{
        constructor(geometry = true, name = "", material, model_transform = Mat4.identity()) {
            this.model_transform = model_transform
            this.geometry = geometry 
            this.material = material
            this.name = name
            this.parts = []
            this.initial_center_x = [0,0,0]
            this.center_x = [0,0,0]
            this.w = 0
            this.h = 0
            this.d = 0
            this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
     }
        addParts(part){ this.parts.push(part)}  //Used to add child parts to the current object.

        draw(context, program_state, transform = Mat4.identity()) {
            var overall_transform = transform.times(this.model_transform)
            if (this.geometry && typeof this.geometry.draw === 'function') {
                this.geometry.draw(context, program_state, overall_transform, this.material)
            } 
            for (let part of this.parts) {  //Keep multiple enabled functions or drawings running.
                part.draw(context, program_state, overall_transform)
            }
        }

        return_pos() {
            return this.center_x  //Returns the current center of the object
        }
        update_bound() {  //Updating the bounding box of an object
            this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)

        }
        change_pos(transform) {
            /* this.initial_center_x[0] = this.model_transform[0][3]
            this.initial_center_x[1] = this.model_transform[1][3]
            this.initial_center_x[2] = this.model_transform[2][3] */
            this.center_x[0] = this.model_transform[0][3]
            this.center_x[1] =this.model_transform[1][3]
            this.center_x[2] =this.model_transform[2][3]
        } 

        update_pos() {
            this.center_x[0] = this.initial_center_x[0] +this.model_transform[0][3]
            this.center_x[1] = this.initial_center_x[1] +this.model_transform[1][3]
            this.center_x[2] = this.initial_center_x[2] +this.model_transform[2][3]
        }
    }

class HumanFigure extends SceneGraph {
    constructor(material, model_transform=Mat4.identity()) {
        super(true, "Humanfigure", material, model_transform)
        this.leftArm = new SceneGraph(new Cube(), "LeftArm", material)
        this.rightArm = new SceneGraph(new Cube(), "RightArm", material)
        this.body = new SceneGraph(new Cube(), "Body", material)
        this.head = new Head(material)
        this.leftLeg = new SceneGraph(new Cube(), "LeftLeg", material)
        this.rightLeg = new SceneGraph(new Cube(), "RightLeg", material)
        this.fb = true
        this.w = 3 * .8 //abs 
        this.h = 7.5 *.8// abs
        this.d = 3 *.8
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        

        this.head.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.rotation(Math.PI, 1, 0, 0))
        this.leftArm.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0))
                                                        .times(Mat4.translation(1.4, -2.2, 0))
                                                        .times(Mat4.scale(.4, 1, .3))
                                                    //.times(Mat4.rotation(Math.PI/4, 0, 0, 1))

        this.rightArm.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(-1.4, -2.2, 0))
                                                        .times(Mat4.scale(.4, 1, .3))
                                                        
        this.body.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(0, -2.5, 0))
                                                        .times(Mat4.scale(1, 1.5, 0.55))
        
        this.leftLeg.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(-0.5, -5, 0))
                                                        .times(Mat4.scale(0.45, 1.5, 0.4))
        this.rightLeg.model_transform = this.model_transform.times(Mat4.translation(0, 2.75, 0)).times(Mat4.translation(0.5, -5, 0))
                                                        .times(Mat4.scale(0.45, 1.5, 0.4))
        this.reference = new Cube()
        this.initialLeftArmTransform = this.leftArm.model_transform.copy();
        this.initialRightArmTransform = this.rightArm.model_transform.copy();
        this.initialLeftLegTransform = this.leftLeg.model_transform.copy();
        this.initialRightLegTransform = this.rightLeg.model_transform.copy();
        this.initialHead = this.head.model_transform.copy()
        this.initialBody = this.body.model_transform.copy()
      
        this.addParts(this.head)
        this.addParts(this.leftArm)
        this.addParts(this.rightArm)
        this.addParts(this.body)
        this.addParts(this.leftLeg)
        this.addParts(this.rightLeg)

}
    update_pos() {
        
        super.update_pos()
    }
    update() {
        this.leftArm.model_transform = this.initialLeftArmTransform
        this.rightArm.model_transform = this.initialLeftArmTransform
        this.leftLeg.model_transform = this.initialLeftLegTransform
        this.rightLeg.model_transform = this.initialRightArmTransform
        this.head.model_transform = this.initialHead
        this.body.model_transform = this.initialBody
   
    }

 
    update_bound () {
        super.update_bound()
    }
    
    draw(context, program_state, transform = Mat4.identity()) {
        
        super.draw(context, program_state, transform, this.material.override({texture:new Texture("assets/smile.jpg")}))
    }

    swingArm(time) {

        let angle = Math.sin(2*time) * Math.PI / 6; 

        this.leftArm.model_transform = this.initialLeftArmTransform
            .times(Mat4.scale(1/.4, 1, 1/.3))
            .times(Mat4.translation(1.4, 1, 0))
            .times(Mat4.rotation(angle, 1, 0, 0))
            .times(Mat4.translation(-1.4, -1, 0))
            .times(Mat4.scale(.4, 1, .3))

        this.rightArm.model_transform = this.initialRightArmTransform
            .times(Mat4.scale(1/.4, 1, 1/.3))
            .times(Mat4.translation(-1.4, 1, 0))
            .times(Mat4.rotation(-angle, 1, 0, 0))
            .times(Mat4.translation(1.4, -1, 0))
            .times(Mat4.scale(.4, 1, .3))

    }
    swingLeg(time) {
        let angle = Math.sin(2* time) * Math.PI / 8; 

        this.leftLeg.model_transform = this.initialLeftLegTransform
            .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
            .times(Mat4.translation(0.5, 2, 0))
            .times(Mat4.rotation(angle, 1, 0, 0))
            .times(Mat4.translation(-0.5, -2, 0))
            .times(Mat4.scale(.45, 1.5, .4))

        this.rightLeg.model_transform = this.initialRightLegTransform
        .times(Mat4.scale(1/.45, 1/1.5, 1/.4))
        .times(Mat4.translation(-0.5, 2, 0))
        .times(Mat4.rotation(-angle, 1, 0, 0))
        .times(Mat4.translation(0.5, -2, 0))
        .times(Mat4.scale(.45, 1.5, .4))


    }
    stop_swin() {
        this.leftArm.model_transform = this.initialLeftArmTransform;
        this.rightArm.model_transform = this.initialRightArmTransform;
        this.leftLeg.model_transform = this.initialLeftLegTransform;
        this.rightLeg.model_transform = this.initialRightLegTransform;

    }
}

class Head extends SceneGraph {
    constructor(material) {
        super(false, "Head", material); 
        this.main = new SceneGraph(new defs.Subdivision_Sphere(4), "Main", material)
        this.leye = new SceneGraph(new defs.Subdivision_Sphere(4), "LeftEye", material.override({color: hex_color("#000000")}))
        this.reye = new SceneGraph(new defs.Subdivision_Sphere(4), "RightEye", material.override({color: hex_color("#000000")}))
        this.transform = Mat4.identity()

        this.basicArrange()
        this.addParts(this.main)
        this.addParts(this.leye)
        this.addParts(this.reye)
    }
    basicArrange() {
        this.main.model_transform = this.model_transform.times(Mat4.scale(1, 1, 1))
                                                        .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
            
        this.leye.model_transform = this.model_transform.times(Mat4.translation(-0.3, 0.1, 0.8))
                                        .times(Mat4.scale(0.1, 0.2, 0.2));
        this.reye.model_transform = this.model_transform.times(Mat4.translation(0.3, 0.1, 0.8))
                                        .times(Mat4.scale(0.1, 0.2, 0.2)); 
    }
    draw(context, program_state, transform) {
        // Draw the main part and eyes
        super.draw(context, program_state, transform, this.material)
    
        
    }

}

class soccerNet extends SceneGraph {
    constructor(material, model_transform=Mat4.identity()) {
        super(false, 'net', material, model_transform)
        // The frame of a soccer goal
        this.rod1 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod1",  material.override({texture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod2 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod2", material.override({texture: new Texture("assets/iron.jpg"),ambient:.3}) ) 
        this.rod3 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod3",  material.override({texture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod4 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod4",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod5 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod5",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod6 = new SceneGraph(new Cylindrical_Tube(5, 100), "rod6", material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        // Two bars for obstacles
        this.rod7 = new SceneGraph(new Cylindrical_Tube(5, 200), "rod7",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3})) 
        this.rod8 = new SceneGraph(new Cylindrical_Tube(5, 200), "rod8",  material.override({ctexture: new Texture("assets/iron.jpg"), ambient:.3}))
        // Three sides of the net of a soccer goal
        this.face1 = new SceneGraph(new Cube(), "face1", material.override({ambient:.3}))
        this.face2 = new SceneGraph(new Triangle(), "face2", material.override({ambient:.3}))
        this.face3 = new SceneGraph(new Triangle(), "face3", material.override({ambient:.3}))
        this.collision_bound = new Cube()
        this.reference = new Cube()
        this.w = 12.6 //abs 
        this.h = 6.6 // abs
        this.d = 7
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        this.basicArrange()  // Transform the object first
        
        this.addParts(this.rod1)
        this.addParts(this.rod2)
        this.addParts(this.rod3)
        this.addParts(this.rod4)
        this.addParts(this.rod5)
        this.addParts(this.rod6)
        this.addParts(this.rod7)
        this.addParts(this.rod8)
        this.addParts(this.face1)
        this.addParts(this.face2)
        this.addParts(this.face3)
    }

    basicArrange() {
        //这个rod很诡异，先scale再rotate会变成奇怪的东西
        this.rod1.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                    .times(Mat4.scale(0.3, 0.3, 6))
        this.rod2.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                    .times(Mat4.scale(0.3, 0.3, 6))
                                    .times(Mat4.translation(12 * (1/0.3), 0, 0))

        this.rod3.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.translation(0, -2.8, 3.8))
                                    .times(Mat4.scale(0.3, 0.3, 8));

        this.rod4.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.translation(12, -2.8, 3.8))
                                    .times(Mat4.scale(0.3, 0.3, 8));

        this.rod5.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.rotation(0.6435, 1, 0, 0))
                                    .times(Mat4.scale(0.3, 0.3, 10))
                                    .times(Mat4.translation(0, 8, .3));

        this.rod6.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.rotation(0.6435, 1, 0, 0))
                                    .times(Mat4.scale(0.3, 0.3, 10))
                                    .times(Mat4.translation(12/.3, 8, .3));

        this.rod7.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                    .times(Mat4.scale(0.3, 0.3, 12))
                                    .times(Mat4.translation(0, 2.8/0.3, .5))

        this.rod8.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                    .times(Mat4.scale(0.3, 0.3, 12))
                                    .times(Mat4.translation(-7.6/0.3, -2.8/0.3, .5))

        this.face1.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    //.times(Mat4.scale(1, 1, 0.01))
                                    //.times(Mat4.translation(1, 0, 0))
                                    .times(Mat4.rotation(-0.92729, 1, 0, 0))
                                    .times(Mat4.scale(6,4.75,0.01)) 
                                    .times(Mat4.translation(1, -.6, 250))
   

        this.face2.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.scale(1, 6, -8))
                                    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                    .times(Mat4.translation(0, -0.5, 0))

        this.face3.model_transform = Mat4.identity().times(Mat4.translation(-6.3,0,-4.3))
                                    .times(Mat4.scale(1, 6, -8))
                                    .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
                                    .times(Mat4.translation(0, -.5, 12))



    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}

class Block1 extends SceneGraph {
    constructor(material, model_transform=Mat4.identity()) {
        super(false, "block1", material, model_transform)
        this.rod1 = new SceneGraph(new Capped_Cylinder(5, 100), "rod11",  this.material.override({texture: new Texture("assets/iron.jpg"), specularity:.1}))
        this.rod2 = new SceneGraph(new Capped_Cylinder(5, 100), "rod21",  this.material.override({texture: new Texture("assets/iron.jpg"), specularity:.1}))
        this.face1 = new SceneGraph(new Cube(), "face1", material)
        this.face2 = new SceneGraph(new Cube(), "face2", material)
        this.w = 9.2 * .7
        //10.6 //abs 
        this.h = 6  * .7// abs
        this.d = .2 * .7
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        this.basicArrange()
        this.addParts(this.rod1)
        this.addParts(this.rod2)
        this.addParts(this.face1)
        this.addParts(this.face2)

    }
    basicArrange() {
        this.rod1.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
        .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
        .times(Mat4.scale(0.3,0.3,6))
        this.rod2.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
                                    .times(Mat4.rotation(Math.PI/2, 1, 0, 0))
                                    .times(Mat4.scale(0.3,0.3,6))
                                    .times(Mat4.translation(10/0.3, 0, 0))
                                    //cube default length = 2

        this.face1.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
                                    .times(Mat4.rotation(Math.PI/24, 0, 0, 1))
                                    .times(Mat4.scale(5/0.99,1,0.01))
                                    .times(Mat4.rotation(-Math.PI/128, 0, 0, 1))
                                    .times(Mat4.translation(1, 0.3, 0))

        this.face2.model_transform = Mat4.identity().times(Mat4.translation(-5, 0, 0))
                                    .times(Mat4.rotation(-Math.PI/12, 0, 0, 1))
                                    .times(Mat4.scale(5/0.96,0.5,0.01))
                                    .times(Mat4.rotation(Math.PI/128, 0, 0, 1))
                                    .times(Mat4.translation(1, 3/0.8, -1))
                                                                               

    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}

class Chicken extends SceneGraph{
    constructor(material, model_transform=Mat4.identity()) {
        super(false, "group", material, model_transform)
        this.first = new Chick(material)
        this.second = new Chick(material)
        this.third = new Chick(material)
        this.w = 10.3//abs 
        this.h = 3.6 // abs
        this.d = 1.8
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)
        //console.log(this.center_x)
    
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        this.basicArrange()
        this.addParts(this.first)
        this.addParts(this.second)
        this.addParts(this.third)

    }
    basicArrange() {
        this.first.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, 0, -4))
        this.second.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, 0, 0))
        this.third.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 0, 1, 0)).times(Mat4.translation(0, 0, 4))
        this.first.initial_model_transform = this.first.model_transform
        this.second.initial_model_transform = this.second.model_transform
        this.third.initial_model_transform = this.third.model_transform

    }
    
    //走路的时候扭屁股
     wobble(time, direction = 1) {
        let angle = direction * Math.sin(4*time) * Math.PI /10
        this.first.model_transform = this.first.initial_model_transform .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
                                                                            .times(Mat4.rotation(angle, 0, 1, 0))
                                                                            .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        this.second.model_transform = this.second.initial_model_transform .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
                                                                            .times(Mat4.rotation(angle, 0, 1, 0))
                                                                            .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        this.third.model_transform = this.third.initial_model_transform .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
                                                                            .times(Mat4.rotation(angle, 0, 1, 0))
                                                                            .times(Mat4.rotation(Math.PI/2, 0, 1, 0))
        

    } 
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
    }

}

class Chick extends SceneGraph {
    constructor(material, model_transform=Mat4.identity()) {
        super(false, "chick", material, model_transform)
        this.head = new SceneGraph(new Head(material), "head",  material)
        this.body = new SceneGraph(new Cube(), "body", material)
        this.body2= new SceneGraph(new Cube(), "body2", material)
        this.body3 = new SceneGraph(new Cube(), "body3", material)
        this.body4 = new SceneGraph(new Cube(), "body4", material)
        this.body5 = new SceneGraph(new Cube(), "body5", material)
        this.mouse = new SceneGraph(new Cube(), "mouse", material.override({color: hex_color ('#C96303')}))
        this.wing1 =new SceneGraph(new Cube(), "wing1", material.override({color: hex_color('#ebc600')}))
        this.wing2= new SceneGraph(new Cube(), "wing2", material.override({color: hex_color('#ebc600')}))
        this.head_addon =new SceneGraph(new Cube(), "addon", material.override({color: hex_color ('#B90007')}))
        this.head_addon2 =new SceneGraph(new Cube(), "addon", material.override({color: hex_color ('#B90007')}))
        this.leg1 = new SceneGraph(new Cube(), "mouse", material)
        this.leg2= new SceneGraph(new Cube(), "mouse", material)
        this.feet1= new SceneGraph(new Cube(), "mouse", material.override({color: hex_color ('#C96303')}))
        this.feet2= new SceneGraph(new Cube(), "mouse", material.override({color: hex_color ('#C96303')}))
        this.w = 1.2 //abs 
        this.h = 3.6 // abs
        this.d = 3
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)

        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)

        this.basicArrange()
        this.addParts(this.head)
        this.addParts(this.body)
        this.addParts(this.body2)
        this.addParts(this.mouse)
        this.addParts(this.body3)
        this.addParts(this.body4)
        this.addParts(this.wing1)
        this.addParts(this.wing2)
        this.addParts(this.leg1)
        this.addParts(this.leg2)
        this.addParts(this.feet1)
        this.addParts(this.feet2)
        this.addParts(this.head_addon)
        this.addParts(this.head_addon2)

    }
    basicArrange() {
        this.head.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1))     
        this.head_addon.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.rotation(-Math.PI/6, 1, 0, 0))
                                                            .times(Mat4.scale(.1, .3, .1))
                                                            .times(Mat4.translation(0, 1/0.3, .4/.1))
        this.head_addon2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.rotation(Math.PI/6, 1, 0, 0))
                                                            .times(Mat4.scale(.1, .3, .1))
                                                            .times(Mat4.translation(0, 1/0.3, -.3/.1)) 
                                                         
        this.body.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(1, .8, 1))    
                                                    .times(Mat4.translation(0, -1.2/.8, -1))
        this.body2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.6, .5, .2))    
                                                    .times(Mat4.translation(0, -1.4/.5, 1))
        this.body3.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.7, .8, .3))    
                                                    .times(Mat4.translation(0, -1/.8, -2.3/.3))
        this.body4.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.5, .6, .2))    
                                                    .times(Mat4.translation(0, -.7/.6, -2.8/.2))
        this.mouse.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.3, .2, .4))    
                                                    .times(Mat4.translation(0, -0.8, 1/.4))
                                                    
        this.wing1.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .4, .5))    
                                                    .times(Mat4.translation(1/.2, -1.2/.4, -1/.5))
        this.wing2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .4, .5))    
                                                    .times(Mat4.translation(-1/.2, -1.2/.4, -1/.5))
        this.leg1.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .3, .1))
                                                    .times(Mat4.translation(-.5/.2, -2.2/.3, -.7/.1))
        this.leg2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.2, .3, .1))
                                                    .times(Mat4.translation(.5/.2, -2.2/.3, -.7/.1))
        this.feet1.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.3, .1, .3))
                                                    .times(Mat4.translation(.5/.3, -2.5/.1, -.6/.3))
        this.feet2.model_transform = Mat4.identity().times(Mat4.translation(0, .8, 1)).times(Mat4.scale(.3, .1, .3))
                                                    .times(Mat4.translation(-.5/.3, -2.5/.1, -.6/.3))

    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}

class Soccer_ball extends SceneGraph {
    constructor(material, model_transform = Mat4.identity()) {
        super(false, "soccer_ball", material, model_transform); 
        this.ball = new SceneGraph(new defs.Subdivision_Sphere(4), "Ball", material)
        this.transform = Mat4.identity()

        this.basicArrange()
        this.addParts(this.ball)
        this.w = 1.2 //abs 
        this.h = 1.2 // abs
        this.d = 1.2
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)

        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        
    }
    basicArrange() {
        //this.ball.model_transform = this.model_transform.times(Mat4.translation( 0, 0, 17))
                                                       // .times(Mat4.rotation(-Math.PI/2, 0, 1, 0))
            
        
    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
    }
}


//盒子装的检测区域，需要球体的话可以增加sphere的碰撞检测
class BoundingBox {
    //x, y ,z is the center of the obj
    constructor(x, y, z, width, height, depth) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.width = width;
        this.height = height;
        this.depth = depth;
    }

    // only works for +z face
    // find_face_normal(other){   
    //     let face_p1 = vec3(other.w/2, other.h/2, other.d/2)
    //     let face_p2 = vec3(-other.w/2, other.h/2, other.d/2)
    //     let face_p3 = vec3(other.w/2, -other.h/2, other.d/2)
    //     let face_v1 = face_p2.minus(face_p1)
    //     let face_v2 = face_p3.minus(face_p1)
    //     console.log(face_v1.cross(face_v2))
    //     return face_v1.cross(face_v2)
    // }
    // 检查与另一个盒子的碰撞
    intersects(other) {
        //console.log(Math.abs(this.x + other.x), Math.abs(this.width/2 + other.width/2), Math.abs(this.z + other.z), Math.abs(this.depth/2+ other.depth/2))
        //console.log(other.x, other.z)
        return ((Math.abs(this.x - other.x) <= this.width/2 + other.width/2 &&
        Math.abs(this.z - other.z) <= this.depth/2 + other.depth/2) && Math.abs(this.y - other.y) <= this.height/2 + other.height/2)
    }
    close(other) {
        return ((Math.abs(this.x - other.x) <= this.width/2 - other.width/2 + 0.2 &&
        Math.abs(this.z - other.z) <= this.depth/2 - other.depth/2 + 0.2) && !this.intersects(other))
    }
    intersects2(other) {
        return((Math.abs(this.y - other.y) <= this.height/2 + other.height/2))
    }
}



class Te extends SceneGraph {
    constructor(material) {
        super(false, 'te', material)
        this.c = new SceneGraph(new Cube(), 'a', this.material)
        this.addParts(this.c)
        this.w = 2
        this.d = 2
        this.h = 2
        this.c.model_transform - Mat4.identity()
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        
    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}


class Block2 extends SceneGraph {
    constructor(material, model_transform){
        super(false, 'block2', material, model_transform)
        this.main = new SceneGraph(new Closed_Cone(100, 100), "main", material)
        this.plate = new SceneGraph(new Torus(100, 100), "plate", material) 
        this.basicArrange()
        this.addParts(this.main)
        this.addParts(this.plate)
        this.w = 1 //abs 
        this.h = 1.5 // abs
        this.d = 1
        this.initial_center_x = [0, 0, 0]
        this.center_x = [0, 0, 0]
        this.change_pos(this.model_transform)
        this.bound = new BoundingBox(this.center_x[0], this.center_x[1], this.center_x[2], this.w, this.h, this.d)
        for (let i = 0; i < this.main.geometry.arrays.texture_coord.length; ++i) {
            this.main.geometry.arrays.texture_coord[i].scale_by(1/100)
        } 
    }
    basicArrange() {
        this.main.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, -1, 0, 0).times(Mat4.scale(1, 1, 1.5))).times(Mat4.translation(0, 0, .5))
        this.plate.model_transform = Mat4.identity().times(Mat4.rotation(Math.PI/2, 1, 0, 0).times(Mat4.scale(1.5, 1.5, .3))).times(Mat4.translation(0, 0, .8/.3))
    }
    draw(context, program_state, transform) {
        super.draw(context, program_state, transform, this.material)
        
    }
}
